"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Sparkles, Star, Check, Loader2, Mail } from "lucide-react";

type BillingStatus = {
  tier: "free" | "pro";
  stripeConfigured: boolean;
  googleAuthConfigured: boolean;
  aiConfigured: boolean;
  pdlConfigured: boolean;
  emailConfigured: boolean;
  gmailDirectSendAvailable: boolean;
  gmailConnected: boolean;
  gmailSendingEnabled: boolean;
  gmailSendAsEmail: string | null;
  gmailLastSendError: string | null;
  listingImportConfigured: boolean;
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

type SettingsAction =
  | "checkout"
  | "portal"
  | "gmail-connect"
  | "gmail-disconnect"
  | "gmail-enable"
  | "gmail-disable"
  | null;

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
  const [action, setAction] = useState<SettingsAction>(null);

  const loadBillingStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/status");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load billing status");
      }

      setBillingStatus(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load billing status";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");
    const gmailResult = params.get("gmail");

    if (billingResult === "success") {
      toast.success("Billing updated. Refreshing your subscription status.");
    }

    if (billingResult === "cancelled") {
      toast.message("Checkout cancelled.");
    }

    if (gmailResult === "connected") {
      toast.success("Gmail direct send connected.");
    }

    if (gmailResult === "denied") {
      toast.message("Gmail connection was cancelled.");
    }

    if (gmailResult === "missing-refresh-token") {
      toast.error("Google did not return a refresh token. Try connecting Gmail again.");
    }

    if (gmailResult === "not-configured") {
      toast.error("Google OAuth is not configured for Gmail direct send.");
    }

    if (gmailResult === "error") {
      toast.error("Unable to connect Gmail right now.");
    }

    if (billingResult || gmailResult) {
      params.delete("billing");
      params.delete("gmail");
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    void loadBillingStatus();
  }, [loadBillingStatus]);

  const isPro = billingStatus?.tier === "pro";
  const stripeReady = billingStatus?.stripeConfigured ?? false;

  const followUpMode = useMemo(() => {
    if (!billingStatus) {
      return "Checking...";
    }

    if (billingStatus.gmailConnected && billingStatus.gmailSendingEnabled) {
      return "Direct Gmail send";
    }

    if (billingStatus.emailConfigured) {
      return "Platform email (Resend)";
    }

    return "Draft only";
  }, [billingStatus]);

  const handleGmailDisconnect = useCallback(async () => {
    try {
      setAction("gmail-disconnect");
      const res = await fetch("/api/integrations/gmail/disconnect", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to disconnect Gmail");
      }

      toast.success("Gmail direct send disconnected.");
      await loadBillingStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to disconnect Gmail";
      toast.error(message);
    } finally {
      setAction(null);
    }
  }, [loadBillingStatus]);

  const handleGmailToggle = useCallback(
    async (enabled: boolean) => {
      try {
        setAction(enabled ? "gmail-enable" : "gmail-disable");
        const res = await fetch("/api/integrations/gmail/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to update Gmail send preference");
        }

        toast.success(
          enabled
            ? "Gmail direct send enabled for follow-ups."
            : "Platform email is active for follow-ups."
        );
        await loadBillingStatus();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update Gmail send preference";
        toast.error(message);
      } finally {
        setAction(null);
      }
    },
    [loadBillingStatus]
  );

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
                  detail: "Required for platform email delivery and Gmail send fallback",
                },
                {
                  label: "Gmail Direct Send",
                  configured: billingStatus.gmailDirectSendAvailable,
                  detail: "Optional advanced follow-up delivery from an agent Gmail inbox",
                },
                {
                  label: "Listing Data Service",
                  configured: billingStatus.listingImportConfigured,
                  detail: "Required for Import by MLS # and Import by Address event backfill",
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Follow-up Delivery</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose whether Pro follow-up emails go out through OpenHouse or directly from your
                Gmail inbox.
              </p>
            </div>
            <Badge
              className={
                billingStatus?.gmailConnected && billingStatus?.gmailSendingEnabled
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                  : "border-border/70 bg-card/60 text-muted-foreground"
              }
            >
              {followUpMode}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading || !billingStatus ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading delivery settings...
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-500" />
                      <p className="text-sm font-medium">Gmail direct send</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {billingStatus.gmailConnected
                        ? `Connected as ${billingStatus.gmailSendAsEmail}`
                        : "Connect a Gmail inbox if you want follow-up emails to come from an agent mailbox instead of the platform sender."}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      If Gmail send fails, OpenHouse automatically falls back to Resend when it is
                      configured. Otherwise the system saves a draft only.
                    </p>
                  </div>
                  <Badge
                    className={
                      billingStatus.gmailConnected
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                        : "border-border/70 bg-card/60 text-muted-foreground"
                    }
                  >
                    {billingStatus.gmailConnected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
              </div>

              {billingStatus.gmailLastSendError && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900">
                  <p className="font-medium">Last Gmail send issue</p>
                  <p className="mt-1 text-amber-800">{billingStatus.gmailLastSendError}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!billingStatus.gmailConnected ? (
                  <Button
                    disabled={!billingStatus.gmailDirectSendAvailable || action === "gmail-connect"}
                    onClick={() => {
                      setAction("gmail-connect");
                      window.location.href = "/api/integrations/gmail/connect?returnTo=/dashboard/settings";
                    }}
                  >
                    {action === "gmail-connect" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Connect Gmail
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={billingStatus.gmailSendingEnabled ? "outline" : "default"}
                      disabled={
                        action === "gmail-enable" ||
                        action === "gmail-disable" ||
                        action === "gmail-disconnect"
                      }
                      onClick={() => {
                        void handleGmailToggle(!billingStatus.gmailSendingEnabled);
                      }}
                    >
                      {action === "gmail-enable" || action === "gmail-disable" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      {billingStatus.gmailSendingEnabled
                        ? "Use Platform Email Instead"
                        : "Use Gmail Direct Send"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={
                        action === "gmail-enable" ||
                        action === "gmail-disable" ||
                        action === "gmail-disconnect"
                      }
                      onClick={() => {
                        void handleGmailDisconnect();
                      }}
                    >
                      {action === "gmail-disconnect" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Disconnect Gmail
                    </Button>
                  </>
                )}
              </div>

              {!billingStatus.gmailDirectSendAvailable && (
                <p className="text-sm text-amber-700">
                  Add Google OAuth client credentials before enabling Gmail direct send.
                </p>
              )}

              {!billingStatus.emailConfigured && !billingStatus.gmailSendingEnabled && (
                <p className="text-sm text-amber-700">
                  Platform email is not configured. If Gmail direct send stays off, follow-ups will
                  save as drafts only.
                </p>
              )}
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
