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
        })
        .from(users)
        .where(eq(users.id, Number(session.user.id)))
        .limit(1);

    // Get sign-in(s) to process
    const signInsToProcess = signInId
        ? await db.select().from(signIns).where(and(eq(signIns.id, signInId), eq(signIns.eventId, Number(id)))).limit(1)
        : await db.select().from(signIns).where(and(eq(signIns.eventId, Number(id)), eq(signIns.followUpSent, false)));

    const results = [];
    const canSendEmail = isEmailConfigured();

    for (const signIn of signInsToProcess) {
        if (!signIn.email) continue; // Skip if no email

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
                pdlData: signIn.pdlData as Record<string, unknown> | null,
            });

            if (canSendEmail) {
                await sendTransactionalEmail({
                    to: signIn.email,
                    subject: result.subject,
                    text: result.body,
                    replyTo: agent?.email,
                });
            }

            await db
                .update(signIns)
                .set({
                    followUpContent: JSON.stringify({ subject: result.subject, body: result.body }),
                    followUpSent: canSendEmail,
                    followUpSentAt: canSendEmail ? new Date() : null,
                })
                .where(eq(signIns.id, signIn.id));

            results.push({
                signInId: signIn.id,
                visitorName: signIn.fullName,
                email: signIn.email,
                subject: result.subject,
                body: result.body,
                deliveryStatus: canSendEmail ? "sent" : "draft",
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
        deliveryMode: canSendEmail ? "sent" : "draft",
    });
}
