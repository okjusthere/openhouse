/**
 * AI Sign-In Processing API
 * POST /api/events/[id]/process-signin — Process a sign-in with AI scoring + PDL enrichment
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { events, signIns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateRuleBasedScore, buildGptScoringPrompt, mergeGptScore } from "@/lib/ai/lead-scoring";
import { enrichContact } from "@/lib/ai/pdl-enrichment";
import { chatCompletion } from "@/lib/ai/openai";
import { isPro } from "@/lib/plans";

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

    // Get sign-in record
    const [signIn] = await db
        .select()
        .from(signIns)
        .where(and(eq(signIns.id, signInId), eq(signIns.eventId, Number(id))))
        .limit(1);

    if (!signIn) {
        return NextResponse.json({ error: "Sign-in not found" }, { status: 404 });
    }

    const userIsPro = isPro(session.user.subscriptionTier);

    // Phase 1: Rule-based scoring (always runs)
    const ruleScore = calculateRuleBasedScore({
        fullName: signIn.fullName,
        phone: signIn.phone,
        email: signIn.email,
        hasAgent: signIn.hasAgent ?? false,
        isPreApproved: signIn.isPreApproved,
        interestLevel: signIn.interestLevel,
        buyingTimeline: signIn.buyingTimeline,
        priceRange: signIn.priceRange,
        customAnswers: signIn.customAnswers as Record<string, string> | null,
    });

    let finalScore = ruleScore;
    let pdlResult = null;

    if (userIsPro) {
        // Phase 2a: PDL Enrichment (Pro only)
        try {
            pdlResult = await enrichContact(Number(session.user.id), {
                email: signIn.email || undefined,
                phone: signIn.phone || undefined,
            });

            if (pdlResult.found && pdlResult.data) {
                await db
                    .update(signIns)
                    .set({
                        pdlEnriched: true,
                        pdlData: pdlResult.data,
                        pdlEnrichedAt: new Date(),
                    })
                    .where(eq(signIns.id, signInId));
            }
        } catch (error) {
            console.error("[AI] PDL enrichment failed:", error);
        }

        // Phase 2b: GPT-enhanced scoring (Pro only)
        try {
            const gptPrompt = buildGptScoringPrompt(
                {
                    fullName: signIn.fullName,
                    phone: signIn.phone,
                    email: signIn.email,
                    hasAgent: signIn.hasAgent ?? false,
                    isPreApproved: signIn.isPreApproved,
                    interestLevel: signIn.interestLevel,
                    buyingTimeline: signIn.buyingTimeline,
                    priceRange: signIn.priceRange,
                },
                ruleScore,
                pdlResult?.data as Record<string, unknown> | null
            );

            const gptResult = await chatCompletion({
                messages: [{ role: "user", content: gptPrompt }],
                maxTokens: 500,
                temperature: 0.3,
                responseFormat: "json",
            });

            const gptResponse = JSON.parse(gptResult.content);
            finalScore = mergeGptScore(ruleScore, gptResponse);
        } catch (error) {
            console.error("[AI] GPT scoring failed, using rule-based score:", error);
        }
    }

    // Save scoring results
    await db
        .update(signIns)
        .set({
            leadScore: finalScore,
            leadTier: finalScore.tier,
            aiRecommendation: finalScore.recommendation,
        })
        .where(eq(signIns.id, signInId));

    // Update hot leads counter on event
    if (finalScore.tier === "hot") {
        const hotCount = await db
            .select()
            .from(signIns)
            .where(and(eq(signIns.eventId, Number(id)), eq(signIns.leadTier, "hot")));

        await db
            .update(events)
            .set({ hotLeadsCount: hotCount.length })
            .where(eq(events.id, Number(id)));
    }

    return NextResponse.json({
        score: finalScore,
        pdl: pdlResult ? { found: pdlResult.found, cached: pdlResult.cached } : null,
        enhanced: userIsPro,
    });
}
