import { and, eq, gte, lt, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { PLAN_LIMITS, type PlanTier } from "@/lib/plans";
import { getDb } from "@/lib/db";
import { events, signIns, users, type User } from "@/lib/db/schema";
import { absoluteUrl } from "@/lib/site";
import { isStripeConfigured } from "@/lib/stripe";

export function normalizePlanTier(tier: string | null | undefined): PlanTier {
  return tier === "pro" ? "pro" : "free";
}

export function getPlanEntitlements(tier: PlanTier) {
  const limits = PLAN_LIMITS[tier];

  return {
    subscriptionTier: tier,
    pdlCreditsLimit: limits.pdlCredits,
    aiQueriesLimit: limits.aiQueries,
  };
}

export function getNextMonthBoundary(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
}

export function getCurrentMonthWindow(now = new Date()) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    end: getNextMonthBoundary(now),
  };
}

function getDefaultUsageResetAt(tier: PlanTier, now = new Date()) {
  if (tier === "free") {
    return getNextMonthBoundary(now);
  }

  const nextReset = new Date(now);
  nextReset.setMonth(nextReset.getMonth() + 1);
  return nextReset;
}

export async function ensureUsageWindow(userId: number) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    return null;
  }

  const tier = normalizePlanTier(user.subscriptionTier);
  const now = new Date();
  const resetNeeded = !user.usageResetAt || user.usageResetAt <= now;
  const entitlements = getPlanEntitlements(tier);
  const limitsNeedRepair =
    user.pdlCreditsLimit !== entitlements.pdlCreditsLimit ||
    user.aiQueriesLimit !== entitlements.aiQueriesLimit;

  if (!resetNeeded && !limitsNeedRepair) {
    return user;
  }

  const nextResetAt = resetNeeded
    ? getDefaultUsageResetAt(tier, now)
    : user.usageResetAt ?? getDefaultUsageResetAt(tier, now);

  await db
    .update(users)
    .set({
      ...entitlements,
      pdlCreditsUsed: resetNeeded ? 0 : user.pdlCreditsUsed,
      aiQueriesUsed: resetNeeded ? 0 : user.aiQueriesUsed,
      usageResetAt: nextResetAt,
    })
    .where(eq(users.id, userId));

  const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return updatedUser ?? user;
}

export async function countEventsThisMonth(userId: number) {
  const db = getDb();
  const window = getCurrentMonthWindow();

  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as signed)` })
    .from(events)
    .where(and(eq(events.userId, userId), gte(events.createdAt, window.start), lt(events.createdAt, window.end)));

  return Number(row?.count ?? 0);
}

export async function countSignInsThisMonth(userId: number) {
  const db = getDb();
  const window = getCurrentMonthWindow();

  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as signed)` })
    .from(signIns)
    .innerJoin(events, eq(signIns.eventId, events.id))
    .where(and(eq(events.userId, userId), gte(signIns.signedInAt, window.start), lt(signIns.signedInAt, window.end)));

  return Number(row?.count ?? 0);
}

export async function getBillingSnapshot(userId: number) {
  const user = await ensureUsageWindow(userId);

  if (!user) {
    return null;
  }

  const tier = normalizePlanTier(user.subscriptionTier);
  const limits = PLAN_LIMITS[tier];
  const [eventsUsed, signInsUsed] = await Promise.all([
    countEventsThisMonth(userId),
    countSignInsThisMonth(userId),
  ]);

  return {
    user,
    tier,
    limits,
    eventsUsed,
    signInsUsed,
    stripeConfigured: isStripeConfigured(),
  };
}

export function getCheckoutSuccessUrl() {
  return absoluteUrl("/dashboard/settings?billing=success");
}

export function getCheckoutCancelUrl() {
  return absoluteUrl("/dashboard/settings?billing=cancelled");
}

export function getBillingPortalReturnUrl() {
  return absoluteUrl("/dashboard/settings");
}

function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id ?? null;
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const itemPeriodEnd = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => Number.isFinite(value))
    .sort((a, b) => b - a)[0];

  return itemPeriodEnd ?? null;
}

function getUserIdFromSubscription(subscription: Stripe.Subscription) {
  const metadataUserId = subscription.metadata?.userId;

  if (!metadataUserId) {
    return null;
  }

  const parsed = Number(metadataUserId);
  return Number.isFinite(parsed) ? parsed : null;
}

async function findUserForSubscription(subscription: Stripe.Subscription) {
  const db = getDb();
  const metadataUserId = getUserIdFromSubscription(subscription);

  if (metadataUserId) {
    const [user] = await db.select().from(users).where(eq(users.id, metadataUserId)).limit(1);
    if (user) {
      return user;
    }
  }

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  return user ?? null;
}

export async function syncSubscriptionState(subscription: Stripe.Subscription) {
  const db = getDb();
  const user = await findUserForSubscription(subscription);

  if (!user) {
    throw new Error("Unable to map Stripe subscription to an OpenHouse user");
  }

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  const priceId = getSubscriptionPriceId(subscription);
  const configuredProPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const isActiveSubscription =
    subscription.status === "active" || subscription.status === "trialing";
  const tier: PlanTier =
    isActiveSubscription && configuredProPriceId && priceId === configuredProPriceId
      ? "pro"
      : "free";
  const entitlements = getPlanEntitlements(tier);
  const periodEnd = getSubscriptionPeriodEnd(subscription)
    ? new Date(getSubscriptionPeriodEnd(subscription)! * 1000)
    : getDefaultUsageResetAt(tier);

  await db
    .update(users)
    .set({
      ...entitlements,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      usageResetAt: periodEnd,
      pdlCreditsUsed: 0,
      aiQueriesUsed: 0,
    })
    .where(eq(users.id, user.id));

  if (tier === "free") {
    await db.update(events).set({ aiQaEnabled: false }).where(eq(events.userId, user.id));
  }
}

export async function downgradeUserToFreeByCustomer(customerId: string) {
  const db = getDb();
  const entitlements = getPlanEntitlements("free");

  await db
    .update(users)
    .set({
      ...entitlements,
      stripeCustomerId: customerId,
      stripeSubscriptionId: null,
      usageResetAt: getDefaultUsageResetAt("free"),
      pdlCreditsUsed: 0,
      aiQueriesUsed: 0,
    })
    .where(eq(users.stripeCustomerId, customerId));

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1);

  if (user) {
    await db.update(events).set({ aiQaEnabled: false }).where(eq(events.userId, user.id));
  }
}

export function isBillingEnabledForUser(user: Pick<User, "subscriptionTier">) {
  return normalizePlanTier(user.subscriptionTier) === "pro";
}
