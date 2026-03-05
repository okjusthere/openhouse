/**
 * Property Q&A Chatbot Service
 * 
 * RAG-based chatbot that answers visitor questions about the property
 * using MLS data, property description, custom FAQ, and POI info.
 */
import { chatCompletion } from "./openai";

interface PropertyContext {
    propertyAddress: string;
    listPrice?: string | null;
    propertyType?: string | null;
    bedrooms?: number | null;
    bathrooms?: string | null;
    sqft?: number | null;
    yearBuilt?: number | null;
    propertyDescription?: string | null;
    customFaq?: Array<{ question: string; answer: string }>;
    mlsData?: Record<string, unknown>;
    nearbyPoi?: Record<string, unknown>;
}

interface ChatHistory {
    role: "user" | "assistant";
    content: string;
}

/**
 * Build the system prompt with property context (RAG-style).
 */
function buildSystemPrompt(context: PropertyContext): string {
    let prompt = `You are a helpful and friendly AI assistant at an Open House for:
**${context.propertyAddress}**

Your role is to answer visitor questions about this property, the neighborhood, and the buying process. Be concise, accurate, and helpful. If you don't have specific information, say so honestly and suggest the visitor ask the listing agent directly.

## Property Details
- Address: ${context.propertyAddress}`;

    if (context.listPrice) prompt += `\n- Listed Price: $${Number(context.listPrice).toLocaleString()}`;
    if (context.propertyType) prompt += `\n- Type: ${context.propertyType.replace("_", " ")}`;
    if (context.bedrooms) prompt += `\n- Bedrooms: ${context.bedrooms}`;
    if (context.bathrooms) prompt += `\n- Bathrooms: ${context.bathrooms}`;
    if (context.sqft) prompt += `\n- Square Feet: ${context.sqft.toLocaleString()}`;
    if (context.yearBuilt) prompt += `\n- Year Built: ${context.yearBuilt}`;
    if (context.propertyDescription) {
        prompt += `\n\n## Property Description\n${context.propertyDescription}`;
    }

    if (context.customFaq && context.customFaq.length > 0) {
        prompt += "\n\n## FAQ (from the listing agent)";
        context.customFaq.forEach((faq) => {
            prompt += `\n**Q:** ${faq.question}\n**A:** ${faq.answer}`;
        });
    }

    if (context.mlsData && Object.keys(context.mlsData).length > 0) {
        prompt += `\n\n## Additional MLS Data\n${JSON.stringify(context.mlsData, null, 2)}`;
    }

    if (context.nearbyPoi && Object.keys(context.nearbyPoi).length > 0) {
        prompt += `\n\n## Nearby Points of Interest\n${JSON.stringify(context.nearbyPoi, null, 2)}`;
    }

    prompt += `\n\n## Rules
- Keep answers SHORT (2-3 sentences max)
- Be enthusiastic but truthful
- For pricing/financing questions, suggest talking to the agent or a lender
- Never make up specific facts you don't have
- If asked about offers, say to discuss with the listing agent`;

    return prompt;
}

/**
 * Send a message to the property Q&A chatbot.
 */
export async function chatWithProperty(
    context: PropertyContext,
    userMessage: string,
    history: ChatHistory[] = []
): Promise<{ reply: string; tokensUsed: number }> {
    const systemPrompt = buildSystemPrompt(context);

    const messages = [
        { role: "system" as const, content: systemPrompt },
        ...history.map((h) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
        })),
        { role: "user" as const, content: userMessage },
    ];

    const result = await chatCompletion({
        messages,
        maxTokens: 300,
        temperature: 0.7,
    });

    return {
        reply: result.content,
        tokensUsed: result.tokensUsed,
    };
}
