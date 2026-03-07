"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Users,
    Flame,
    Clock,
    TrendingUp,
    Download,
    Share2,
    Printer,
    CalendarDays,
    MapPin,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatPublicModeLabel, inferCaptureMode } from "@/lib/public-mode";

interface SignIn {
    id: number;
    fullName: string;
    phone: string | null;
    email: string | null;
    captureMode: string | null;
    hasAgent: boolean;
    isPreApproved: string | null;
    interestLevel: string | null;
    buyingTimeline: string | null;
    priceRange: string | null;
    leadTier: string | null;
    leadScore: { overallScore: number; tier: string } | null;
    signedInAt: string;
}

interface EventDetail {
    id: number;
    uuid: string;
    propertyAddress: string;
    mlsNumber: string | null;
    listPrice: string | null;
    startTime: string;
    endTime: string;
    publicMode: string;
    status: string;
    totalSignIns: number;
    hotLeadsCount: number;
    bedrooms: number | null;
    bathrooms: string | null;
    sqft: number | null;
    signIns: SignIn[];
}

export default function SellerReportPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvent = useCallback(async () => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                setEvent(await res.json());
            }
        } catch {
            toast.error("Failed to load event");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchEvent(); }, [fetchEvent]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Event not found</p>
            </div>
        );
    }

    const signIns = event.signIns || [];
    const attributedSignIns = signIns.map((signIn) => ({
        ...signIn,
        inferredCaptureMode: inferCaptureMode({
            captureMode: signIn.captureMode,
            eventPublicMode: event.publicMode,
            signedInAt: signIn.signedInAt,
            eventEndTime: event.endTime,
        }),
    }));
    const hotLeads = signIns.filter(
        (s) => s.leadTier === "hot" || s.interestLevel === "very"
    );
    const warmLeads = signIns.filter(
        (s) => s.leadTier === "warm" || s.interestLevel === "somewhat"
    );
    const withAgent = signIns.filter((s) => s.hasAgent).length;
    const preApproved = signIns.filter((s) => s.isPreApproved === "yes").length;
    const noAgent = signIns.filter((s) => !s.hasAgent).length;
    const openHouseCaptures = attributedSignIns.filter((s) => s.inferredCaptureMode === "open_house").length;
    const listingInquiryCaptures = attributedSignIns.filter((s) => s.inferredCaptureMode === "listing_inquiry").length;
    const scoredLeadCount = signIns.filter((signIn) => signIn.leadScore?.overallScore !== undefined).length;
    const averageLeadScore = scoredLeadCount
        ? Math.round(
            signIns.reduce((sum, signIn) => sum + (signIn.leadScore?.overallScore ?? 0), 0) / scoredLeadCount
        )
        : 0;
    const directBuyerPercent = signIns.length ? Math.round((noAgent / signIns.length) * 100) : 0;
    const inquiryShare = signIns.length ? Math.round((listingInquiryCaptures / signIns.length) * 100) : 0;
    const onSiteShare = signIns.length ? Math.round((openHouseCaptures / signIns.length) * 100) : 0;
    const executiveSummary = [
        signIns.length === 0
            ? "No demand has been captured yet, so this report will update once the public link starts converting traffic."
            : `${signIns.length} total captures came through this listing, including ${hotLeads.length} high-priority leads worth immediate follow-up.`,
        listingInquiryCaptures > 0
            ? `${listingInquiryCaptures} captures happened through the reusable listing link after the live event, showing the page kept producing demand beyond the open house window.`
            : "So far, all captured demand has come from the live open house traffic rather than later link sharing.",
        noAgent > 0
            ? `${noAgent} visitors came in without a buyer agent, creating a direct-conversion opportunity for the listing side.`
            : "Most captured traffic already has buyer-agent representation, so next steps should focus on offer timing and relationship management.",
    ];
    const sellerTalkingPoints = [
        {
            title: "Demand quality",
            body:
                hotLeads.length > 0
                    ? `${hotLeads.length} visitors signaled strong intent, giving the seller a concrete shortlist of buyers to watch.`
                    : "The event generated traffic, but no visitors yet stand out as clearly high-intent leads.",
        },
        {
            title: "Traffic mix",
            body:
                listingInquiryCaptures > 0
                    ? `${inquiryShare}% of captured demand came through the reusable public link after the event, which supports ongoing marketing and buyer-agent sharing.`
                    : `${onSiteShare}% of captured demand came directly from the live open house, so the event itself remains the primary conversion channel.`,
        },
        {
            title: "Agent opportunity",
            body:
                noAgent > 0
                    ? `${directBuyerPercent}% of captured visitors were not working with an agent, which is a meaningful direct-lead opportunity.`
                    : "Most captured visitors are represented, so agent-to-agent follow-up and timing discipline matter more than raw lead count.",
        },
    ];

    // Timeline breakdown by hour
    const hourMap: Record<string, number> = {};
    attributedSignIns
        .filter((signIn) => signIn.inferredCaptureMode === "open_house")
        .forEach((s) => {
        if (s.signedInAt) {
            const hour = format(new Date(s.signedInAt), "h:mm a");
            hourMap[hour] = (hourMap[hour] || 0) + 1;
        }
    });

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/events`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Seller Report</h1>
                        <p className="text-muted-foreground text-sm">{event.propertyAddress}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Report link copied!");
                        }}
                    >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/events/${id}/export/csv`)}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                    </Button>
                </div>
            </div>

            {/* Property Summary */}
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-emerald-400" />
                                {event.propertyAddress}
                            </h2>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                {event.mlsNumber && <span>MLS# {event.mlsNumber}</span>}
                                {event.listPrice && <span>${Number(event.listPrice).toLocaleString()}</span>}
                                {event.bedrooms && <span>{event.bedrooms} bed</span>}
                                {event.bathrooms && <span>{event.bathrooms} bath</span>}
                                {event.sqft && <span>{event.sqft.toLocaleString()} sqft</span>}
                                <span>{formatPublicModeLabel(event.publicMode)} link enabled</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
                                {" · "}
                                {format(new Date(event.startTime), "h:mm a")} –{" "}
                                {format(new Date(event.endTime), "h:mm a")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{signIns.length}</div>
                        <div className="text-xs text-muted-foreground">Total Captures</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{hotLeads.length}</div>
                        <div className="text-xs text-muted-foreground">Hot Leads</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{preApproved}</div>
                        <div className="text-xs text-muted-foreground">Pre-Approved</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{noAgent}</div>
                        <div className="text-xs text-muted-foreground">Direct Buyer Opportunities</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Share2 className="h-6 w-6 text-teal-500 mx-auto mb-2" />
                        <div className="text-3xl font-bold">{listingInquiryCaptures}</div>
                        <div className="text-xs text-muted-foreground">Long-Term Link Leads</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/60 bg-gradient-to-br from-background via-card/70 to-muted/20">
                <CardHeader>
                    <CardTitle className="text-base">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-3">
                        {executiveSummary.map((line) => (
                            <div
                                key={line}
                                className="rounded-2xl border border-border/50 bg-background/75 p-4 text-sm leading-relaxed text-muted-foreground"
                            >
                                {line}
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-3">
                        <div className="rounded-2xl border border-border/50 bg-background/75 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Average AI score
                            </p>
                            <p className="mt-2 text-3xl font-bold">{averageLeadScore}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {scoredLeadCount > 0
                                    ? `Based on ${scoredLeadCount} captured visitors with AI lead scoring attached.`
                                    : "No AI-scored leads yet for this listing."}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/75 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Ongoing demand
                            </p>
                            <p className="mt-2 text-3xl font-bold">{inquiryShare}%</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Share of captured demand generated by the reusable link after the live event.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Visitors with an agent</span>
                        <span className="font-medium">{withAgent} ({signIns.length ? Math.round(withAgent / signIns.length * 100) : 0}%)</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pre-approved buyers</span>
                        <span className="font-medium">{preApproved} ({signIns.length ? Math.round(preApproved / signIns.length * 100) : 0}%)</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Very interested</span>
                        <span className="font-medium">{hotLeads.length} ({signIns.length ? Math.round(hotLeads.length / signIns.length * 100) : 0}%)</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Warm leads</span>
                        <span className="font-medium">{warmLeads.length} ({signIns.length ? Math.round(warmLeads.length / signIns.length * 100) : 0}%)</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Seller Talking Points</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {sellerTalkingPoints.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-border/50 bg-background/70 p-4"
                        >
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {item.body}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Lead Attribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Separate live open house traffic from leads captured later through the reusable public link so the seller can see whether interest kept building after the doors closed.
                    </p>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">On-site open house captures</span>
                                <span className="font-medium">{openHouseCaptures} ({onSiteShare}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/40">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                    style={{ width: `${signIns.length ? (openHouseCaptures / signIns.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Reusable-link listing inquiries</span>
                                <span className="font-medium">{listingInquiryCaptures} ({inquiryShare}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted/40">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                                    style={{ width: `${signIns.length ? (listingInquiryCaptures / signIns.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            {Object.keys(hourMap).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Live Open House Traffic Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {Object.entries(hourMap).map(([hour, count]) => (
                                <div key={hour} className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground w-20">{hour}</span>
                                    <div className="flex-1 bg-muted/30 rounded-full h-6 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-end pr-2"
                                            style={{
                                                width: `${Math.max(20, (count / Math.max(...Object.values(hourMap))) * 100)}%`,
                                            }}
                                        >
                                            <span className="text-xs font-medium text-white">{count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Visitor List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">All Visitors ({signIns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {signIns.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No visitors have signed in yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {attributedSignIns.map((s, i) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{s.fullName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {[s.phone, s.email].filter(Boolean).join(" · ") || "No contact info"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.interestLevel === "very" && (
                                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 text-xs">
                                                HOT
                                            </Badge>
                                        )}
                                        {s.interestLevel === "somewhat" && (
                                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                                                WARM
                                            </Badge>
                                        )}
                                        {s.isPreApproved === "yes" && (
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                                                Pre-Approved
                                            </Badge>
                                        )}
                                        {!s.hasAgent && (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                                                No Agent
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="text-xs">
                                            {formatPublicModeLabel(s.inferredCaptureMode)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {s.signedInAt ? format(new Date(s.signedInAt), "h:mm a") : ""}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
