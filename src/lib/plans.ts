/**
 * Feature tiers and usage limits for OpenHouse Pro.
 */

export type UsageCap = number | null;

export const PLAN_LIMITS = {
    free: {
        maxEventsPerMonth: null,
        maxSignInsPerMonth: 150,
        pdlCredits: 0,
        aiQueries: 0,
        aiLeadScoring: false,
        aiFollowUp: false,
        aiPropertyQa: false,
        csvExport: true,
        sellerReport: "basic" as const,
        crmIntegration: "export_only" as const,
    },
    pro: {
        maxEventsPerMonth: null,
        maxSignInsPerMonth: null,
        pdlCredits: 0,
        aiQueries: 500,
        aiLeadScoring: true,
        aiFollowUp: true,
        aiPropertyQa: true,
        csvExport: true,
        sellerReport: "detailed" as const,
        crmIntegration: "zapier_api" as const,
    },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

/**
 * Check if a user has access to a Pro feature.
 */
export function isPro(tier: string): boolean {
    return tier === "pro";
}

export function hasUsageCap(limit: UsageCap): limit is number {
    return typeof limit === "number" && Number.isFinite(limit);
}

/**
 * Generic helper for capped usage counters.
 */
export function hasPdlCredits(used: number, limit: number): boolean {
    return used < limit;
}
