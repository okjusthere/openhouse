/**
 * CSV Export API
 * GET /api/events/[id]/export/csv — Download sign-ins as CSV
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, signIns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Verify ownership
    const [event] = await db
        .select()
        .from(events)
        .where(
            and(
                eq(events.id, Number(id)),
                eq(events.userId, Number(session.user.id))
            )
        )
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get all sign-ins
    const eventSignIns = await db
        .select()
        .from(signIns)
        .where(eq(signIns.eventId, Number(id)));

    // Build CSV
    const headers = [
        "Name", "Phone", "Email", "Has Agent", "Pre-Approved",
        "Interest Level", "Buying Timeline", "Price Range",
        "Lead Score", "Lead Tier", "Signed In At",
    ];

    const rows = eventSignIns.map((s) => [
        s.fullName,
        s.phone || "",
        s.email || "",
        s.hasAgent ? "Yes" : "No",
        s.isPreApproved || "",
        s.interestLevel || "",
        s.buyingTimeline || "",
        s.priceRange || "",
        (s.leadScore as Record<string, unknown>)?.overallScore ?? "",
        s.leadTier || "",
        s.signedInAt?.toISOString() || "",
    ]);

    const csv = [
        headers.join(","),
        ...rows.map((r) =>
            r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");

    const filename = `open-house-${event.propertyAddress.replace(/[^a-z0-9]/gi, "-")}-${event.id}.csv`;

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
