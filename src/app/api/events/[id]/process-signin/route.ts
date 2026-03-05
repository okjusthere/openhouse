/**
 * AI Sign-In Processing API
 * POST /api/events/[id]/process-signin — Process a sign-in with AI scoring + PDL enrichment
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { processSignInWithAi } from "@/lib/ai/process-signin";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Verify event ownership
    const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, Number(id)), eq(events.userId, Number(session.user.id))))
        .limit(1);

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const signInId = body.signInId;

    if (!signInId) {
        return NextResponse.json({ error: "signInId required" }, { status: 400 });
    }

    try {
        const result = await processSignInWithAi({
            eventId: Number(id),
            signInId: Number(signInId),
            userId: Number(session.user.id),
            subscriptionTier: session.user.subscriptionTier || "free",
        });

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to process sign-in";
        const status = message === "Sign-in not found" ? 404 : 500;
        if (status === 500) {
            console.error("[AI] Process sign-in error:", error);
        }
        return NextResponse.json({ error: message }, { status });
    }
}
