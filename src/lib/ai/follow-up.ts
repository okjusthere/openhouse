/**
 * AI Follow-Up Email Generator
 * 
 * Generates personalized follow-up emails based on visitor data,
 * lead score, and enrichment profile.
 */
import { chatCompletion } from "./openai";
import type { LeadScore } from "./lead-scoring";

interface FollowUpContext {
    agentName: string;
    propertyAddress: string;
    listPrice?: string | null;
    visitorName: string;
    visitorEmail?: string | null;
    interestLevel?: string | null;
    buyingTimeline?: string | null;
    hasAgent?: boolean;
    isPreApproved?: string | null;
    leadScore?: LeadScore | null;
    pdlData?: {
        job_title?: string;
        job_company_name?: string;
        [key: string]: unknown;
    } | null;
}

/**
 * Generate a personalized follow-up email for a visitor.
 */
export async function generateFollowUpEmail(
    context: FollowUpContext
): Promise<{ subject: string; body: string; tokensUsed: number }> {
    const tierStrategy: Record<string, string> = {
        hot: "Urgent, personalized, mention their specific interest signals. Create urgency. Suggest a private showing or next steps. Be warm and professional.",
        warm: "Friendly and informative. Include property highlights that match their interests. Suggest staying in touch and offer to help with their search.",
        cold: "Casual and low-pressure. Thank them for visiting. Offer to be a resource if they decide to buy. Include your contact info.",
    };

    const tier = context.leadScore?.tier || "warm";

    let visitorProfile = `- Name: ${context.visitorName}
- Interest Level: ${context.interestLevel || "Unknown"}
- Buying Timeline: ${context.buyingTimeline || "Unknown"}
- Has Agent: ${context.hasAgent ? "Yes" : "No"}
- Pre-Approved: ${context.isPreApproved || "Unknown"}`;

    if (context.leadScore) {
        visitorProfile += `\n- Lead Score: ${context.leadScore.overallScore}/100 (${tier})`;
    }

    if (context.pdlData?.job_title) {
        visitorProfile += `\n- Job Title: ${context.pdlData.job_title}`;
    }
    if (context.pdlData?.job_company_name) {
        visitorProfile += `\n- Company: ${context.pdlData.job_company_name}`;
    }

    const prompt = `You are writing a follow-up email from a real estate agent after an Open House visit.

## Agent Info
- Agent Name: ${context.agentName}
- Property: ${context.propertyAddress}
${context.listPrice ? `- List Price: $${Number(context.listPrice).toLocaleString()}` : ""}

## Visitor Profile
${visitorProfile}

## Strategy (${tier} lead)
${tierStrategy[tier]}

## Rules
- Keep the email under 150 words
- Be genuine and not salesy
- Include a clear call-to-action
- Sign off with the agent's name
- DO NOT use generic phrases like "I hope this email finds you well"

Respond in JSON format:
{
  "subject": "Email subject line",
  "body": "Full email body text"
}`;

    const result = await chatCompletion({
        messages: [{ role: "user", content: prompt }],
        maxTokens: 500,
        temperature: 0.8,
        responseFormat: "json",
    });

    try {
        const parsed = JSON.parse(result.content);
        return {
            subject: parsed.subject || `Thanks for visiting ${context.propertyAddress}`,
            body: parsed.body || "",
            tokensUsed: result.tokensUsed,
        };
    } catch {
        return {
            subject: `Thanks for visiting ${context.propertyAddress}`,
            body: result.content,
            tokensUsed: result.tokensUsed,
        };
    }
}
