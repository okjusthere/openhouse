/**
 * Public Event Sign-In API
 * GET  /api/public/event/[uuid]          — Get event info (no auth)
 * POST /api/public/event/[uuid]/sign-in  — Submit sign-in (no auth)
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { events, signIns, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { processSignInWithAi } from "@/lib/ai/process-signin";
import { PLAN_LIMITS } from "@/lib/plans";
import { countSignInsThisMonth, ensureUsageWindow, normalizePlanTier } from "@/lib/billing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasAiConfiguration } from "@/lib/ai/openai";
import { buildPublicChatAccessCookie, hasPublicChatAccessCookie } from "@/lib/public-chat-access";
import { buildPublicListingMarketing } from "@/lib/public-listing-view";

const signInSchema = z.object({
    fullName: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email("Valid email is required"),
    hasAgent: z.boolean().optional(),
    isPreApproved: z.enum(["yes", "no", "not_yet"]).optional(),
    interestLevel: z.enum(["very", "somewhat", "just_looking"]).optional(),
    buyingTimeline: z
        .enum(["0_3_months", "3_6_months", "6_12_months", "over_12_months", "just_browsing"])
        .optional(),
    priceRange: z.string().optional(),
    customAnswers: z.record(z.string(), z.string()).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const db = getDb();

    const [event] = await db
        .select({
            uuid: events.uuid,
            propertyAddress: events.propertyAddress,
            listPrice: events.listPrice,
            startTime: events.startTime,
            endTime: events.endTime,
            status: events.status,
            branding: events.branding,
            complianceText: events.complianceText,
            customFields: events.customFields,
            propertyType: events.propertyType,
            bedrooms: events.bedrooms,
            bathrooms: events.bathrooms,
            sqft: events.sqft,
            propertyPhotos: events.propertyPhotos,
            propertyDescription: events.propertyDescription,
            aiQaEnabled: events.aiQaEnabled,
            aiQaContext: events.aiQaContext,
            userId: events.userId,
        })
        .from(events)
        .where(eq(events.uuid, uuid))
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const [owner] = await db
        .select({
            subscriptionTier: users.subscriptionTier,
        })
        .from(users)
        .where(eq(users.id, event.userId))
        .limit(1);

    const aiQaEnabled =
        event.aiQaEnabled &&
        owner?.subscriptionTier === "pro" &&
        hasAiConfiguration();
    const aiQaContext = event.aiQaContext as {
        customFaq?: Array<{ question: string; answer: string }>;
        mlsData?: Record<string, unknown>;
        nearbyPoi?: Record<string, unknown>;
    } | null;
    const marketing = buildPublicListingMarketing({
        propertyAddress: event.propertyAddress,
        propertyType: event.propertyType,
        bedrooms: event.bedrooms,
        bathrooms: event.bathrooms,
        sqft: event.sqft,
        propertyDescription: event.propertyDescription,
        aiQaContext,
    });

    return NextResponse.json({
        uuid: event.uuid,
        propertyAddress: event.propertyAddress,
        listPrice: event.listPrice,
        startTime: event.startTime,
        endTime: event.endTime,
        status: event.status,
        branding: event.branding,
        complianceText: event.complianceText,
        customFields: event.customFields,
        propertyType: event.propertyType,
        bedrooms: event.bedrooms,
        bathrooms: event.bathrooms,
        sqft: event.sqft,
        propertyPhotos: event.propertyPhotos,
        propertyDescription: event.propertyDescription,
        aiQaEnabled,
        chatUnlocked: aiQaEnabled && hasPublicChatAccessCookie(request.cookies, uuid),
        marketing,
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const db = getDb();

    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.uuid, uuid))
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status === "cancelled") {
        return NextResponse.json(
            { error: "This open house has been cancelled" },
            { status: 400 }
        );
    }

    if (event.status === "draft") {
        return NextResponse.json(
            { error: "This open house is not published yet" },
            { status: 400 }
        );
    }

    const [ownerRecord] = await db
        .select({
            id: users.id,
            subscriptionTier: users.subscriptionTier,
        })
        .from(users)
        .where(eq(users.id, event.userId))
        .limit(1);

    if (!ownerRecord) {
        return NextResponse.json({ error: "Event owner not found" }, { status: 404 });
    }

    const owner = await ensureUsageWindow(ownerRecord.id);

    if (!owner) {
        return NextResponse.json({ error: "Event owner not found" }, { status: 404 });
    }

    const rateLimitResult = checkRateLimit({
        key: `public-signin:${uuid}:${getClientIp(request.headers)}`,
        limit: 12,
        windowMs: 10 * 60 * 1000,
    });

    if (!rateLimitResult.ok) {
        return NextResponse.json(
            { error: "Too many sign-in attempts. Please try again shortly." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const data = signInSchema.parse(body);
        const tier = normalizePlanTier(owner.subscriptionTier);

        if (tier === "free") {
            const signInsUsed = await countSignInsThisMonth(owner.id);

            if (signInsUsed >= PLAN_LIMITS.free.maxSignInsPerMonth) {
                return NextResponse.json(
                    { error: "This account has reached its monthly Free sign-in limit." },
                    { status: 403 }
                );
            }
        }

        const [result] = await db.insert(signIns).values({
            eventId: event.id,
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            hasAgent: data.hasAgent ?? false,
            isPreApproved: data.isPreApproved || "not_yet",
            interestLevel: data.interestLevel || "just_looking",
            buyingTimeline: data.buyingTimeline || null,
            priceRange: data.priceRange || null,
            customAnswers: data.customAnswers || null,
            pdlEnriched: false,
            followUpSent: false,
            crmSyncStatus: "pending",
        });

        await db
            .update(events)
            .set({ totalSignIns: sql`${events.totalSignIns} + 1` })
            .where(eq(events.id, event.id));

        if (tier === "pro") {
            try {
                await processSignInWithAi({
                    eventId: event.id,
                    signInId: Number(result.insertId),
                    userId: owner.id,
                    subscriptionTier: tier,
                });
            } catch (processingError) {
                console.error("[SignIn] Auto AI processing failed:", processingError);
            }
        }

        const aiQaEnabled =
            event.aiQaEnabled &&
            owner.subscriptionTier === "pro" &&
            hasAiConfiguration();
        const response = NextResponse.json(
            {
                signInId: result.insertId,
                success: true,
                aiProcessed: tier === "pro",
                chatUnlocked: aiQaEnabled,
            },
            { status: 201 }
        );

        if (aiQaEnabled) {
            response.cookies.set(buildPublicChatAccessCookie(uuid));
        }

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error("[SignIn] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
