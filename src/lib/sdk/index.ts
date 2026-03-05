/**
 * @openhouse/core SDK
 * 
 * Reusable SDK for integrating OpenHouse functionality into other apps (e.g., Kevv CRM).
 * Exports the core services, types, and utility functions.
 */

// === Types ===
export type {
    User,
    InsertUser,
    Event,
    InsertEvent,
    SignIn,
    InsertSignIn,
    AiConversation,
    InsertAiConversation,
    PdlCache,
    InsertPdlCache,
} from "@/lib/db/schema";

export type { LeadScore } from "@/lib/ai/lead-scoring";
export type { PdlEnrichmentResult } from "@/lib/ai/pdl-enrichment";

// === Services ===
export {
    calculateRuleBasedScore,
    buildGptScoringPrompt,
    mergeGptScore,
} from "@/lib/ai/lead-scoring";

export {
    enrichContact,
    getPdlUsage,
} from "@/lib/ai/pdl-enrichment";

export {
    chatWithProperty,
} from "@/lib/ai/property-qa";

export {
    generateFollowUpEmail,
} from "@/lib/ai/follow-up";

export {
    chatCompletion,
} from "@/lib/ai/openai";

// === Plans ===
export {
    PLAN_LIMITS,
    isPro,
    hasPdlCredits,
    getPdlOverageCost,
} from "@/lib/plans";

export type { PlanTier } from "@/lib/plans";

// === SDK Client for external integration ===
export class OpenHouseClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(config: { baseUrl: string; apiKey: string }) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.apiKey = config.apiKey;
    }

    private async request(path: string, options: RequestInit = {}) {
        const res = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
                ...options.headers,
            },
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Request failed" }));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    }

    /** List all events for the authenticated user */
    async getEvents() {
        return this.request("/api/events");
    }

    /** Get a single event with sign-ins */
    async getEvent(eventId: number) {
        return this.request(`/api/events/${eventId}`);
    }

    /** Create a new event */
    async createEvent(data: {
        propertyAddress: string;
        startTime: string;
        endTime: string;
        [key: string]: unknown;
    }) {
        return this.request("/api/events", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    /** Trigger AI scoring for a sign-in */
    async processSignIn(eventId: number, signInId: number) {
        return this.request(`/api/events/${eventId}/process-signin`, {
            method: "POST",
            body: JSON.stringify({ signInId }),
        });
    }

    /** Generate follow-up emails */
    async generateFollowUps(eventId: number, signInId?: number) {
        return this.request(`/api/events/${eventId}/follow-up`, {
            method: "POST",
            body: JSON.stringify({ signInId }),
        });
    }
}
