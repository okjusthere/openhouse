/**
 * Property Q&A Chatbot API
 * POST /api/public/event/[uuid]/chat — Chat with property AI (no auth for visitors)
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { events, aiConversations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chatWithProperty } from "@/lib/ai/property-qa";
import { randomUUID } from "crypto";

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

    if (!event.aiQaEnabled) {
        return NextResponse.json({ error: "AI Q&A not enabled for this event" }, { status: 403 });
    }

    // Check owner's AI quota
    const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, event.userId))
        .limit(1);

    if (!owner || owner.subscriptionTier === "free") {
        return NextResponse.json({ error: "AI Q&A requires Pro plan" }, { status: 403 });
    }

    if (owner.aiQueriesLimit > 0 && owner.aiQueriesUsed >= owner.aiQueriesLimit) {
        return NextResponse.json({ error: "AI query limit reached" }, { status: 429 });
    }

    const body = await request.json();
    const { message, sessionId: existingSessionId, history } = body;

    if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sessionId = existingSessionId || randomUUID();
    const aiQaContext = event.aiQaContext as {
        customFaq?: Array<{ question: string; answer: string }>;
        mlsData?: Record<string, unknown>;
        nearbyPoi?: Record<string, unknown>;
    } | null;

    try {
        const result = await chatWithProperty(
            {
                propertyAddress: event.propertyAddress,
                listPrice: event.listPrice,
                propertyType: event.propertyType,
                bedrooms: event.bedrooms,
                bathrooms: event.bathrooms,
                sqft: event.sqft,
                yearBuilt: event.yearBuilt,
                propertyDescription: event.propertyDescription,
                customFaq: aiQaContext?.customFaq,
                mlsData: aiQaContext?.mlsData,
                nearbyPoi: aiQaContext?.nearbyPoi,
            },
            message,
            history || []
        );

        // Save conversation
        await db.insert(aiConversations).values([
            { eventId: event.id, sessionId, role: "user", content: message, tokensUsed: 0 },
            { eventId: event.id, sessionId, role: "assistant", content: result.reply, tokensUsed: result.tokensUsed, model: "gpt-4o-mini" },
        ]);

        // Increment AI usage
        await db
            .update(users)
            .set({ aiQueriesUsed: owner.aiQueriesUsed + 1 })
            .where(eq(users.id, owner.id));

        return NextResponse.json({
            reply: result.reply,
            sessionId,
            tokensUsed: result.tokensUsed,
        });
    } catch (error) {
        console.error("[Chat] Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
