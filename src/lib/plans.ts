/**
 * Feature tiers and usage limits for OpenHouse Pro.
 */

export const PLAN_LIMITS = {
    free: {
        maxEventsPerMonth: 3,
        maxSignInsPerMonth: 50,
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
        maxEventsPerMonth: Infinity,
        maxSignInsPerMonth: Infinity,
        pdlCredits: 100,           // 100 per month included
        aiQueries: 500,            // 500 AI Q&A messages per month
        aiLeadScoring: true,
        aiFollowUp: true,
        aiPropertyQa: true,
        csvExport: true,
        sellerReport: "detailed" as const,
        crmIntegration: "zapier_api" as const,
        pdlOverageRate: 0.30,      // $0.30 per extra PDL call
    },
    enterprise: {
        maxEventsPerMonth: Infinity,
        maxSignInsPerMonth: Infinity,
        pdlCredits: Infinity,
        aiQueries: Infinity,
        aiLeadScoring: true,
        aiFollowUp: true,
        aiPropertyQa: true,
        csvExport: true,
        sellerReport: "whitelabel" as const,
        crmIntegration: "full_custom" as const,
        pdlOverageRate: 0,
    },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

/**
 * Check if a user has access to a Pro feature.
 */
export function isPro(tier: string): boolean {
    return tier === "pro" || tier === "enterprise";
}

/**
 * Check if user has remaining PDL credits.
 */
export function hasPdlCredits(used: number, limit: number): boolean {
    // Enterprise has Infinity limit
    return used < limit;
}

/**
 * Calculate PDL overage cost.
 */
export function getPdlOverageCost(
    used: number,
    limit: number,
    tier: PlanTier
): number {
    if (tier === "enterprise" || tier === "free") return 0;
    const overage = Math.max(0, used - limit);
    return overage * PLAN_LIMITS[tier].pdlOverageRate;
}
