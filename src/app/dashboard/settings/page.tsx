"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Sparkles, Star, Check, Loader2 } from "lucide-react";

type BillingStatus = {
  tier: "free" | "pro";
  stripeConfigured: boolean;
  googleAuthConfigured: boolean;
  aiConfigured: boolean;
  pdlConfigured: boolean;
  emailConfigured: boolean;
  eventsUsed: number;
  signInsUsed: number;
  pdlUsed: number;
  pdlLimit: number;
  aiQueriesUsed: number;
  aiQueriesLimit: number;
  usageResetAt: string | null;
  limits: {
    maxEventsPerMonth: number;
    maxSignInsPerMonth: number;
  };
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

async function redirectToBilling(endpoint: "/api/billing/checkout" | "/api/billing/portal") {
  const res = await fetch(endpoint, { method: "POST" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Billing action failed");
  }

  if (!data.url) {
    throw new Error("Billing URL was not returned");
  }

  window.location.href = data.url;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"checkout" | "portal" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");

    if (billingResult === "success") {
      toast.success("Billing updated. Refreshing your subscription status.");
    }

    if (billingResult === "cancelled") {
      toast.message("Checkout cancelled.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingStatus() {
      try {
        const res = await fetch("/api/billing/status");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load billing status");
        }

        if (!cancelled) {
          setBillingStatus(data);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load billing status";
        if (!cancelled) {
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBillingStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const isPro = billingStatus?.tier === "pro";
  const stripeReady = billingStatus?.stripeConfigured ?? false;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and subscription</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm">{session?.user?.name || "—"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm">{session?.user?.email || "—"}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sign-in method</span>
            <span className="text-sm">Google OAuth</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Production Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading || !billingStatus ? (
            <p className="text-sm text-muted-foreground">Checking deployment configuration...</p>
          ) : (
            <>
              {[
                {
                  label: "Google Auth",
                  configured: billingStatus.googleAuthConfigured,
                  detail: "Required for all account access",
                },
                {
                  label: "Stripe Billing",
                  configured: billingStatus.stripeConfigured,
                  detail: "Required for self-serve Pro upgrades and renewals",
                },
                {
                  label: "Azure OpenAI",
                  configured: billingStatus.aiConfigured,
                  detail: "Required for AI scoring, follow-up generation, and property Q&A",
                },
                {
                  label: "People Data Labs",
                  configured: billingStatus.pdlConfigured,
                  detail: "Required for Pro enrichment lookups",
                },
                {
                  label: "Transactional Email",
                  configured: billingStatus.emailConfigured,
                  detail: "Required to send follow-up emails instead of saving drafts only",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge
                    className={
                      item.configured
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-800"
                    }
                  >
                    {item.configured ? "Configured" : "Missing"}
                  </Badge>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card className={isPro ? "border-emerald-500/30" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subscription</CardTitle>
            <Badge
              className={
                isPro
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  : "border-border/70 bg-card/60 text-muted-foreground"
              }
            >
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading billing status...
            </div>
          ) : !billingStatus ? (
            <p className="text-sm text-muted-foreground">Billing status is unavailable right now.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Events</p>
                  <p className="mt-2 text-lg font-semibold">
                    {billingStatus.eventsUsed}
                    {!isPro && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / {billingStatus.limits.maxEventsPerMonth}
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Sign-ins</p>
                  <p className="mt-2 text-lg font-semibold">
                    {billingStatus.signInsUsed}
                    {!isPro && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / {billingStatus.limits.maxSignInsPerMonth}
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">PDL usage</p>
                  <p className="mt-2 text-lg font-semibold">
                    {billingStatus.pdlUsed}
                    {billingStatus.pdlLimit > 0 && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / {billingStatus.pdlLimit}
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">AI Q&A usage</p>
                  <p className="mt-2 text-lg font-semibold">
                    {billingStatus.aiQueriesUsed}
                    {billingStatus.aiQueriesLimit > 0 && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / {billingStatus.aiQueriesLimit}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {billingStatus.usageResetAt && (
                <p className="text-sm text-muted-foreground">
                  Usage resets on {new Date(billingStatus.usageResetAt).toLocaleDateString()}.
                </p>
              )}

              {isPro ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-500" /> Unlimited events
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-500" /> AI lead scoring
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-500" /> 100 PDL / month
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-3 w-3 text-emerald-500" /> 500 AI Q&A / month
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={!stripeReady || action === "portal"}
                    onClick={async () => {
                      try {
                        setAction("portal");
                        await redirectToBilling("/api/billing/portal");
                      } catch (error) {
                        const message =
                          error instanceof Error ? error.message : "Unable to open billing portal";
                        toast.error(message);
                        setAction(null);
                      }
                    }}
                  >
                    {action === "portal" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Manage Billing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Pro to unlock automated AI scoring, follow-up generation, and
                    property Q&A.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-emerald-500" /> AI lead scoring
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-emerald-500" /> 100 PDL credits / month
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-emerald-500" /> AI follow-up drafts
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-emerald-500" /> 500 AI Q&A messages / month
                    </div>
                  </div>
                  <Button
                    className="w-full border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                    disabled={!stripeReady || action === "checkout"}
                    onClick={async () => {
                      try {
                        setAction("checkout");
                        await redirectToBilling("/api/billing/checkout");
                      } catch (error) {
                        const message =
                          error instanceof Error ? error.message : "Unable to start checkout";
                        toast.error(message);
                        setAction(null);
                      }
                    }}
                  >
                    {action === "checkout" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="mr-2 h-4 w-4" />
                    )}
                    Upgrade to Pro — $29/mo
                  </Button>
                  {!stripeReady && (
                    <p className="text-sm text-amber-700">
                      Stripe is not configured in this environment yet.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
