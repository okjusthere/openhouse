/**
 * Azure OpenAI client singleton.
 */

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface ChatCompletionOptions {
    messages: ChatMessage[];
    maxTokens?: number;
    temperature?: number;
    responseFormat?: "json" | "text";
}

export async function chatCompletion(options: ChatCompletionOptions): Promise<{
    content: string;
    tokensUsed: number;
}> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

    if (!endpoint || !apiKey) {
        throw new Error("Azure OpenAI credentials not configured");
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

    const body: Record<string, unknown> = {
        messages: options.messages,
        max_completion_tokens: options.maxTokens || 1000,
        temperature: options.temperature ?? 0.7,
    };

    if (options.responseFormat === "json") {
        body.response_format = { type: "json_object" };
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
        content: choice?.message?.content || "",
        tokensUsed: data.usage?.total_tokens || 0,
    };
}
