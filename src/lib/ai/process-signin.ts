import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { events, signIns } from "@/lib/db/schema";
import {
    buildGptScoringPrompt,
    calculateRuleBasedScore,
    mergeGptScore,
    type LeadScore,
} from "@/lib/ai/lead-scoring";
import { enrichContact } from "@/lib/ai/pdl-enrichment";
import { chatCompletion } from "@/lib/ai/openai";
import { isPro } from "@/lib/plans";

interface ProcessSignInOptions {
    eventId: number;
    signInId: number;
    userId: number;
    subscriptionTier: string;
}

export interface ProcessSignInResult {
    score: LeadScore;
    pdl: { found: boolean; cached: boolean } | null;
    enhanced: boolean;
}

export async function processSignInWithAi({
    eventId,
    signInId,
    userId,
    subscriptionTier,
}: ProcessSignInOptions): Promise<ProcessSignInResult> {
    const db = getDb();

    const [signIn] = await db
        .select()
        .from(signIns)
        .where(and(eq(signIns.id, signInId), eq(signIns.eventId, eventId)))
        .limit(1);

    if (!signIn) {
        throw new Error("Sign-in not found");
    }

    const userIsPro = isPro(subscriptionTier);

    // Phase 1: Rule-based scoring (always)
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
    let pdlResult: Awaited<ReturnType<typeof enrichContact>> | null = null;

    if (userIsPro) {
        // Phase 2a: PDL enrichment (Pro only)
        try {
            pdlResult = await enrichContact(userId, {
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

        // Phase 2b: GPT enhanced scoring (Pro only)
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

    await db
        .update(signIns)
        .set({
            leadScore: finalScore,
            leadTier: finalScore.tier,
            aiRecommendation: finalScore.recommendation,
        })
        .where(eq(signIns.id, signInId));

    // Keep event hot-lead stats always in sync.
    const hotLeads = await db
        .select({ id: signIns.id })
        .from(signIns)
        .where(and(eq(signIns.eventId, eventId), eq(signIns.leadTier, "hot")));

    await db
        .update(events)
        .set({ hotLeadsCount: hotLeads.length })
        .where(eq(events.id, eventId));

    return {
        score: finalScore,
        pdl: pdlResult ? { found: pdlResult.found, cached: pdlResult.cached } : null,
        enhanced: userIsPro,
    };
}
