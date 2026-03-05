/**
 * Public Event Sign-In API
 * GET  /api/public/event/[uuid]          — Get event info (no auth)
 * POST /api/public/event/[uuid]/sign-in  — Submit sign-in (no auth)
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { events, signIns } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const signInSchema = z.object({
    fullName: z.string().min(1, "Name is required"),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
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
    _request: NextRequest,
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
            propertyDescription: events.propertyDescription,
            aiQaEnabled: events.aiQaEnabled,
        })
        .from(events)
        .where(eq(events.uuid, uuid))
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const db = getDb();

    // Look up event
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

    try {
        const body = await request.json();
        const data = signInSchema.parse(body);

        // Create sign-in record
        const [result] = await db.insert(signIns).values({
            eventId: event.id,
            fullName: data.fullName,
            phone: data.phone || null,
            email: data.email || null,
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

        // Increment event sign-in counter
        await db
            .update(events)
            .set({ totalSignIns: sql`${events.totalSignIns} + 1` })
            .where(eq(events.id, event.id));

        return NextResponse.json(
            { signInId: result.insertId, success: true },
            { status: 201 }
        );
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
