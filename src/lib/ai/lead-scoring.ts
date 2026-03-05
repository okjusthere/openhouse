/**
 * AI Lead Scoring Service
 * 
 * Two-phase scoring:
 * 1. Rule-based scoring from sign-in data (instant)
 * 2. GPT-enhanced analysis with enriched data (async)
 */

interface SignInData {
    fullName: string;
    phone?: string | null;
    email?: string | null;
    hasAgent?: boolean;
    isPreApproved?: string | null;
    interestLevel?: string | null;
    buyingTimeline?: string | null;
    priceRange?: string | null;
    customAnswers?: Record<string, string> | null;
}

interface PdlData {
    job_title?: string;
    job_company_name?: string;
    job_company_industry?: string;
    inferred_salary?: string;
    education?: Array<{ school?: { name?: string }; degrees?: string[] }>;
    linkedin_url?: string;
    location_name?: string;
    [key: string]: unknown;
}

export interface LeadScore {
    overallScore: number;       // 0-100
    buyReadiness: number;       // 0-25
    financialStrength: number;  // 0-25
    engagementLevel: number;    // 0-25
    urgency: number;            // 0-25
    tier: "hot" | "warm" | "cold";
    signals: Record<string, unknown>;
    recommendation: string;
}

/**
 * Phase 1: Rule-based scoring from sign-in data alone.
 * Returns an instant score without any API calls.
 */
export function calculateRuleBasedScore(data: SignInData): LeadScore {
    let buyReadiness = 0;
    let financialStrength = 0;
    let engagementLevel = 0;
    let urgency = 0;
    const signals: Record<string, unknown> = {};

    // --- Buy Readiness (0-25) ---
    if (!data.hasAgent) {
        buyReadiness += 10; // No agent = potential new client
        signals.noAgent = true;
    }
    if (data.isPreApproved === "yes") {
        buyReadiness += 15;
        signals.preApproved = true;
    } else if (data.isPreApproved === "not_yet") {
        buyReadiness += 5;
    }

    // --- Financial Strength (0-25) ---
    if (data.isPreApproved === "yes") {
        financialStrength += 15;
    }
    if (data.priceRange) {
        financialStrength += 5;
        signals.priceRange = data.priceRange;
    }
    // Contact completeness signals seriousness
    if (data.email && data.phone) {
        financialStrength += 5;
        signals.fullContact = true;
    } else if (data.email || data.phone) {
        financialStrength += 2;
    }

    // --- Engagement Level (0-25) ---
    if (data.interestLevel === "very") {
        engagementLevel += 20;
        signals.veryInterested = true;
    } else if (data.interestLevel === "somewhat") {
        engagementLevel += 10;
    } else {
        engagementLevel += 3;
    }
    // Custom answers filled out = high engagement
    if (data.customAnswers && Object.keys(data.customAnswers).length > 0) {
        engagementLevel += 5;
        signals.customAnswersFilled = Object.keys(data.customAnswers).length;
    }

    // --- Urgency (0-25) ---
    switch (data.buyingTimeline) {
        case "0_3_months":
            urgency += 25;
            signals.urgentBuyer = true;
            break;
        case "3_6_months":
            urgency += 18;
            break;
        case "6_12_months":
            urgency += 10;
            break;
        case "over_12_months":
            urgency += 5;
            break;
        default:
            urgency += 2;
    }

    const overallScore = Math.min(100, buyReadiness + financialStrength + engagementLevel + urgency);
    const tier = overallScore >= 65 ? "hot" : overallScore >= 35 ? "warm" : "cold";

    const recommendations: Record<string, string> = {
        hot: "High-priority lead! Follow up within 1 hour with a personalized message.",
        warm: "Promising lead. Send a follow-up within 24 hours with property details.",
        cold: "Low urgency. Add to drip campaign for future nurturing.",
    };

    return {
        overallScore,
        buyReadiness,
        financialStrength,
        engagementLevel,
        urgency,
        tier,
        signals,
        recommendation: recommendations[tier],
    };
}

/**
 * Phase 2: GPT-enhanced scoring with PDL enrichment data.
 * Builds a prompt using sign-in + enriched data, asks GPT for refined analysis.
 */
export function buildGptScoringPrompt(
    signInData: SignInData,
    ruleScore: LeadScore,
    pdlData?: PdlData | null
): string {
    let prompt = `You are a real estate lead scoring AI. Analyze this open house visitor and provide a refined lead assessment.

## Visitor Sign-In Data
- Name: ${signInData.fullName}
- Has Agent: ${signInData.hasAgent ? "Yes" : "No"}
- Pre-Approved: ${signInData.isPreApproved || "Unknown"}
- Interest Level: ${signInData.interestLevel || "Unknown"}
- Buying Timeline: ${signInData.buyingTimeline || "Unknown"}
- Price Range: ${signInData.priceRange || "Not specified"}
- Phone: ${signInData.phone ? "Provided" : "Not provided"}
- Email: ${signInData.email ? "Provided" : "Not provided"}

## Rule-Based Score
- Overall: ${ruleScore.overallScore}/100
- Buy Readiness: ${ruleScore.buyReadiness}/25
- Financial Strength: ${ruleScore.financialStrength}/25
- Engagement: ${ruleScore.engagementLevel}/25
- Urgency: ${ruleScore.urgency}/25
- Current Tier: ${ruleScore.tier}`;

    if (pdlData) {
        prompt += `

## Enriched Profile (People Data Lab)
- Job Title: ${pdlData.job_title || "Unknown"}
- Company: ${pdlData.job_company_name || "Unknown"}
- Industry: ${pdlData.job_company_industry || "Unknown"}
- Estimated Income: ${pdlData.inferred_salary || "Unknown"}
- Location: ${pdlData.location_name || "Unknown"}
- LinkedIn: ${pdlData.linkedin_url ? "Available" : "Not found"}
- Education: ${pdlData.education?.[0]?.school?.name || "Unknown"}`;
    }

    prompt += `

## Your Task
Based on ALL available data, provide:
1. An adjusted overall score (0-100) — factor in job/income/education signals
2. Adjusted tier (hot/warm/cold)
3. A concise 2-sentence recommendation for the agent with a specific follow-up strategy
4. Key signals that influenced your scoring

Respond in JSON format:
{
  "adjustedScore": number,
  "adjustedTier": "hot" | "warm" | "cold",
  "recommendation": "string",
  "keySignals": ["string"],
  "financialStrengthAdjustment": number
}`;

    return prompt;
}

/**
 * Parse GPT response and merge with rule-based score.
 */
export function mergeGptScore(
    ruleScore: LeadScore,
    gptResponse: {
        adjustedScore?: number;
        adjustedTier?: string;
        recommendation?: string;
        keySignals?: string[];
        financialStrengthAdjustment?: number;
    }
): LeadScore {
    return {
        ...ruleScore,
        overallScore: gptResponse.adjustedScore ?? ruleScore.overallScore,
        tier: (gptResponse.adjustedTier as "hot" | "warm" | "cold") ?? ruleScore.tier,
        financialStrength:
            ruleScore.financialStrength + (gptResponse.financialStrengthAdjustment ?? 0),
        recommendation: gptResponse.recommendation ?? ruleScore.recommendation,
        signals: {
            ...ruleScore.signals,
            gptSignals: gptResponse.keySignals || [],
            gptEnhanced: true,
        },
    };
}
