"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { Sparkles, Star, Check, CreditCard } from "lucide-react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const tier = session?.user?.subscriptionTier || "free";
    const isPro = tier === "pro" || tier === "enterprise";

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and subscription</p>
            </div>

            {/* Profile Card */}
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
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card className={isPro ? "border-emerald-500/30" : ""}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Subscription</CardTitle>
                        <Badge className={isPro
                            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                        }>
                            {tier === "pro" ? "Pro" : tier === "enterprise" ? "Enterprise" : "Free"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isPro ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-amber-400" />
                                <span>You&apos;re on the {tier === "enterprise" ? "Enterprise" : "Pro"} plan</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Check className="h-3 w-3 text-emerald-400" /> Unlimited Events
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Check className="h-3 w-3 text-emerald-400" /> AI Lead Scoring
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Check className="h-3 w-3 text-emerald-400" /> 100 PDL/mo
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Check className="h-3 w-3 text-emerald-400" /> AI Q&A Chatbot
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Manage Billing
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Upgrade to Pro to unlock AI Lead Scoring, PDL enrichment, and more.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-3 w-3 text-emerald-400" /> AI Lead Scoring
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-3 w-3 text-emerald-400" /> 100 PDL Credits/mo
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-3 w-3 text-emerald-400" /> AI Follow-ups
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="h-3 w-3 text-emerald-400" /> CRM Integration
                                </div>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0">
                                Upgrade to Pro — $29/mo
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
