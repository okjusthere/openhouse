/**
 * Property Q&A Chatbot API
 * GET  /api/public/event/[uuid]/chat?sessionId=xxx — Load persisted messages
 * POST /api/public/event/[uuid]/chat               — Chat with property AI
 */
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
    events,
    aiConversations,
    users,
    type Event,
    type User,
} from "@/lib/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { chatWithProperty } from "@/lib/ai/property-qa";
import { randomUUID } from "crypto";

type EligibleContext =
    | { ok: true; event: Event; owner: User }
    | { ok: false; response: NextResponse };

type ChatHistoryItem = { role: "user" | "assistant"; content: string };

async function loadEligibleContext(uuid: string): Promise<EligibleContext> {
    const db = getDb();

    const [event] = await db
        .select()
        .from(events)
        .where(eq(events.uuid, uuid))
        .limit(1);

    if (!event) {
        return {
            ok: false,
            response: NextResponse.json({ error: "Event not found" }, { status: 404 }),
        };
    }

    if (!event.aiQaEnabled) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "AI Q&A not enabled for this event" },
                { status: 403 }
            ),
        };
    }

    const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, event.userId))
        .limit(1);

    if (!owner || owner.subscriptionTier !== "pro") {
        return {
            ok: false,
            response: NextResponse.json({ error: "AI Q&A requires Pro plan" }, { status: 403 }),
        };
    }

    return { ok: true, event, owner };
}

async function loadPersistedHistory(eventId: number, sessionId: string): Promise<ChatHistoryItem[]> {
    const db = getDb();
    const rows = await db
        .select({
            role: aiConversations.role,
            content: aiConversations.content,
        })
        .from(aiConversations)
        .where(
            and(
                eq(aiConversations.eventId, eventId),
                eq(aiConversations.sessionId, sessionId)
            )
        )
        .orderBy(asc(aiConversations.createdAt))
        .limit(30);

    return rows
        .filter(
            (item): item is { role: "user" | "assistant"; content: string } =>
                item.role === "user" || item.role === "assistant"
        )
        .map((item) => ({ role: item.role, content: item.content }));
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const sessionId = request.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const context = await loadEligibleContext(uuid);
    if (!context.ok) return context.response;

    const messages = await loadPersistedHistory(context.event.id, sessionId);

    return NextResponse.json({ sessionId, messages });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;
    const db = getDb();
    const context = await loadEligibleContext(uuid);
    if (!context.ok) return context.response;
    const { event, owner } = context;

    if (owner.aiQueriesLimit > 0 && owner.aiQueriesUsed >= owner.aiQueriesLimit) {
        return NextResponse.json({ error: "AI query limit reached" }, { status: 429 });
    }

    const body = await request.json();
    const { message, sessionId: existingSessionId, history } = body;

    if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const sessionId = existingSessionId || randomUUID();
    const incomingHistory: ChatHistoryItem[] = Array.isArray(history)
        ? history
            .filter(
                (
                    item: unknown
                ): item is { role: "user" | "assistant"; content: string } =>
                    !!item &&
                    typeof item === "object" &&
                    ("role" in item) &&
                    ("content" in item) &&
                    (item.role === "user" || item.role === "assistant") &&
                    typeof item.content === "string"
            )
            .map((item) => ({ role: item.role, content: item.content }))
            .slice(-20)
        : [];

    const conversationHistory =
        incomingHistory.length > 0
            ? incomingHistory
            : await loadPersistedHistory(event.id, sessionId);

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
            conversationHistory
        );

        // Save conversation
        await db.insert(aiConversations).values([
            { eventId: event.id, sessionId, role: "user", content: message, tokensUsed: 0 },
            { eventId: event.id, sessionId, role: "assistant", content: result.reply, tokensUsed: result.tokensUsed, model: "gpt-4o-mini" },
        ]);

        // Increment AI usage
        await db
            .update(users)
            .set({ aiQueriesUsed: sql`${users.aiQueriesUsed} + 1` })
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
