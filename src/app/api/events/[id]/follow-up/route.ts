/**
 * AI Follow-Up Email API
 * POST /api/events/[id]/follow-up — Generate and optionally send follow-up emails
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, signIns, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateFollowUpEmail } from "@/lib/ai/follow-up";
import { isPro } from "@/lib/plans";
import type { LeadScore } from "@/lib/ai/lead-scoring";
import { isEmailConfigured, sendTransactionalEmail } from "@/lib/email";
import {
    GmailIntegrationError,
    isGmailDirectSendAvailable,
    sendViaGmail,
} from "@/lib/gmail";

type DeliveryMode = "gmail" | "resend" | "draft";

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPro(session.user.subscriptionTier)) {
        return NextResponse.json({ error: "AI Follow-up requires Pro plan" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { signInId } = body;

    const db = getDb();

    // Verify ownership
    const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, Number(id)), eq(events.userId, Number(session.user.id))))
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get agent info
    const [agent] = await db
        .select({
            fullName: users.fullName,
            email: users.email,
            gmailRefreshTokenEncrypted: users.gmailRefreshTokenEncrypted,
            gmailSendAsEmail: users.gmailSendAsEmail,
            gmailSendingEnabled: users.gmailSendingEnabled,
        })
        .from(users)
        .where(eq(users.id, Number(session.user.id)))
        .limit(1);

    // Get sign-in(s) to process
    const signInsToProcess = signInId
        ? await db
              .select()
              .from(signIns)
              .where(and(eq(signIns.id, Number(signInId)), eq(signIns.eventId, Number(id))))
              .limit(1)
        : await db.select().from(signIns).where(and(eq(signIns.eventId, Number(id)), eq(signIns.followUpSent, false)));

    const results = [];
    const canSendEmail = isEmailConfigured();
    let gmailRefreshTokenEncrypted = agent?.gmailRefreshTokenEncrypted ?? null;
    let gmailSendAsEmail = agent?.gmailSendAsEmail ?? null;
    let gmailSendingEnabled = agent?.gmailSendingEnabled ?? false;
    let gmailAvailableForBatch = Boolean(
        isGmailDirectSendAvailable() &&
            gmailSendingEnabled &&
            gmailRefreshTokenEncrypted &&
            gmailSendAsEmail
    );
    let clearedGmailError = false;

    for (const signIn of signInsToProcess) {
        if (!signIn.email) {
            results.push({
                signInId: signIn.id,
                visitorName: signIn.fullName,
                deliveryMode: "draft",
                deliveryStatus: "skipped",
                error: "No email on file",
            });
            continue;
        }

        try {
            const result = await generateFollowUpEmail({
                agentName: agent?.fullName || "Your Agent",
                propertyAddress: event.propertyAddress,
                listPrice: event.listPrice,
                visitorName: signIn.fullName,
                visitorEmail: signIn.email,
                interestLevel: signIn.interestLevel,
                buyingTimeline: signIn.buyingTimeline,
                hasAgent: signIn.hasAgent ?? false,
                isPreApproved: signIn.isPreApproved,
                leadScore: signIn.leadScore as LeadScore | null,
            });

            let deliveryMode: DeliveryMode = "draft";
            const providerErrors: Array<{ provider: "gmail" | "resend"; message: string }> = [];

            if (
                gmailAvailableForBatch &&
                gmailRefreshTokenEncrypted &&
                gmailSendAsEmail
            ) {
                try {
                    await sendViaGmail({
                        refreshTokenEncrypted: gmailRefreshTokenEncrypted,
                        senderEmail: gmailSendAsEmail,
                        to: signIn.email,
                        subject: result.subject,
                        text: result.body,
                        replyTo: agent?.email,
                    });

                    deliveryMode = "gmail";

                    if (!clearedGmailError) {
                        await db
                            .update(users)
                            .set({
                                gmailLastSendError: null,
                            })
                            .where(eq(users.id, Number(session.user.id)));
                        clearedGmailError = true;
                    }
                } catch (error) {
                    const message = getErrorMessage(error, "Gmail send failed");
                    providerErrors.push({ provider: "gmail", message });
                    gmailAvailableForBatch = false;

                    if (error instanceof GmailIntegrationError) {
                        if (error.code === "reauth_required") {
                            await db
                                .update(users)
                                .set({
                                    gmailRefreshTokenEncrypted: null,
                                    gmailSendAsEmail: null,
                                    gmailSendingEnabled: false,
                                    gmailConnectedAt: null,
                                    gmailLastSendError: error.message,
                                })
                                .where(eq(users.id, Number(session.user.id)));
                            gmailRefreshTokenEncrypted = null;
                            gmailSendAsEmail = null;
                            gmailSendingEnabled = false;
                        } else if (error.code === "invalid_sender") {
                            await db
                                .update(users)
                                .set({
                                    gmailSendingEnabled: false,
                                    gmailLastSendError: error.message,
                                })
                                .where(eq(users.id, Number(session.user.id)));
                            gmailSendingEnabled = false;
                        } else {
                            await db
                                .update(users)
                                .set({
                                    gmailLastSendError: error.message,
                                })
                                .where(eq(users.id, Number(session.user.id)));
                        }
                    } else {
                        await db
                            .update(users)
                            .set({
                                gmailLastSendError: message,
                            })
                            .where(eq(users.id, Number(session.user.id)));
                    }
                }
            }

            if (deliveryMode === "draft" && canSendEmail) {
                try {
                    await sendTransactionalEmail({
                        to: signIn.email,
                        subject: result.subject,
                        text: result.body,
                        replyTo: agent?.email,
                    });
                    deliveryMode = "resend";
                } catch (error) {
                    providerErrors.push({
                        provider: "resend",
                        message: getErrorMessage(error, "Platform email delivery failed"),
                    });
                }
            }

            const followUpSent = deliveryMode !== "draft";

            await db
                .update(signIns)
                .set({
                    followUpContent: JSON.stringify({
                        subject: result.subject,
                        body: result.body,
                        deliveryMode,
                        providerErrors,
                    }),
                    followUpSent,
                    followUpSentAt: followUpSent ? new Date() : null,
                })
                .where(eq(signIns.id, signIn.id));

            results.push({
                signInId: signIn.id,
                visitorName: signIn.fullName,
                email: signIn.email,
                subject: result.subject,
                body: result.body,
                deliveryMode,
                deliveryStatus: followUpSent ? "sent" : "draft",
                fallbackUsed:
                    providerErrors.some((item) => item.provider === "gmail") &&
                    deliveryMode !== "gmail",
                providerErrors,
            });
        } catch (error) {
            console.error(`[FollowUp] Error for ${signIn.fullName}:`, error);
            results.push({
                signInId: signIn.id,
                visitorName: signIn.fullName,
                error: "Failed to generate",
            });
        }
    }

    return NextResponse.json({
        results,
        count: results.length,
        deliveryMode:
            results.length === 1
                ? (results[0].deliveryMode ?? "draft")
                : new Set(results.map((item) => item.deliveryMode).filter(Boolean)).size === 1
                  ? (results.find((item) => item.deliveryMode)?.deliveryMode ?? "draft")
                  : "mixed",
    });
}
