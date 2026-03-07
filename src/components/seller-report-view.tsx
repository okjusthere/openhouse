"use client";

import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPublicModeLabel, inferCaptureMode } from "@/lib/public-mode";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Download,
  Flame,
  MapPin,
  Printer,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";

export interface SellerReportSignIn {
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

export interface SellerReportEvent {
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
  signIns: SellerReportSignIn[];
}

type Props = {
  event: SellerReportEvent;
  isPublic?: boolean;
  shareUrl?: string;
  csvUrl?: string;
};

function maskEmail(email: string | null) {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return "Hidden";
  const localMasked =
    local.length <= 2 ? `${local.charAt(0)}*` : `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 2))}`;
  return `${localMasked}@${domain}`;
}

function maskPhone(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-***-${digits.slice(-4)}`;
}

export function SellerReportView({ event, isPublic = false, shareUrl, csvUrl }: Props) {
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
  const hotLeads = signIns.filter((s) => s.leadTier === "hot" || s.interestLevel === "very");
  const warmLeads = signIns.filter((s) => s.leadTier === "warm" || s.interestLevel === "somewhat");
  const withAgent = signIns.filter((s) => s.hasAgent).length;
  const preApproved = signIns.filter((s) => s.isPreApproved === "yes").length;
  const noAgent = signIns.filter((s) => !s.hasAgent).length;
  const openHouseCaptures = attributedSignIns.filter((s) => s.inferredCaptureMode === "open_house").length;
  const listingInquiryCaptures = attributedSignIns.filter((s) => s.inferredCaptureMode === "listing_inquiry").length;
  const scoredLeadCount = signIns.filter((signIn) => signIn.leadScore?.overallScore !== undefined).length;
  const averageLeadScore = scoredLeadCount
    ? Math.round(
        signIns.reduce((sum, signIn) => sum + (signIn.leadScore?.overallScore ?? 0), 0) /
          scoredLeadCount
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

  const hourMap: Record<string, number> = {};
  attributedSignIns
    .filter((signIn) => signIn.inferredCaptureMode === "open_house")
    .forEach((s) => {
      if (s.signedInAt) {
        const hour = format(new Date(s.signedInAt), "h:mm a");
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      }
    });

  const copyShareLink = async () => {
    const target = shareUrl || window.location.href;
    await navigator.clipboard.writeText(target);
    toast.success(isPublic ? "Shared report link copied" : "Seller report share link copied");
  };

  const showBack = !isPublic;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Link href="/dashboard/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Seller Report</h1>
              {isPublic ? (
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                  Shared View
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{event.propertyAddress}</p>
            {isPublic ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Visitor phone numbers and email addresses are hidden in the shared version.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Shareable seller view keeps contact details hidden by default.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {!isPublic ? (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="mr-2 h-4 w-4" />
              Copy Shared Link
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          )}
          {!isPublic && csvUrl ? (
            <Button variant="outline" size="sm" onClick={() => window.open(csvUrl, "_blank", "noopener,noreferrer")}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {event.propertyAddress}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {event.mlsNumber && <span>MLS# {event.mlsNumber}</span>}
                {event.listPrice && <span>${Number(event.listPrice).toLocaleString()}</span>}
                {event.bedrooms && <span>{event.bedrooms} bed</span>}
                {event.bathrooms && <span>{event.bathrooms} bath</span>}
                {event.sqft && <span>{event.sqft.toLocaleString()} sqft</span>}
                <span>{formatPublicModeLabel(event.publicMode)} link enabled</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Card><CardContent className="p-4 text-center"><Users className="mx-auto mb-2 h-6 w-6 text-emerald-400" /><div className="text-3xl font-bold">{signIns.length}</div><div className="text-xs text-muted-foreground">Total Captures</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Flame className="mx-auto mb-2 h-6 w-6 text-orange-400" /><div className="text-3xl font-bold">{hotLeads.length}</div><div className="text-xs text-muted-foreground">Hot Leads</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="mx-auto mb-2 h-6 w-6 text-blue-400" /><div className="text-3xl font-bold">{preApproved}</div><div className="text-xs text-muted-foreground">Pre-Approved</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="mx-auto mb-2 h-6 w-6 text-purple-400" /><div className="text-3xl font-bold">{noAgent}</div><div className="text-xs text-muted-foreground">Direct Buyer Opportunities</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Share2 className="mx-auto mb-2 h-6 w-6 text-teal-500" /><div className="text-3xl font-bold">{listingInquiryCaptures}</div><div className="text-xs text-muted-foreground">Long-Term Link Leads</div></CardContent></Card>
      </div>

      <Card className="border-border/60 bg-gradient-to-br from-background via-card/70 to-muted/20">
        <CardHeader><CardTitle className="text-base">Executive Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {executiveSummary.map((line) => (
              <div key={line} className="rounded-2xl border border-border/50 bg-background/75 p-4 text-sm leading-relaxed text-muted-foreground">{line}</div>
            ))}
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border/50 bg-background/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Average AI score</p>
              <p className="mt-2 text-3xl font-bold">{averageLeadScore}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {scoredLeadCount > 0 ? `Based on ${scoredLeadCount} captured visitors with AI lead scoring attached.` : "No AI-scored leads yet for this listing."}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/75 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ongoing demand</p>
              <p className="mt-2 text-3xl font-bold">{inquiryShare}%</p>
              <p className="mt-2 text-xs text-muted-foreground">Share of captured demand generated by the reusable link after the live event.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Key Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Visitors with an agent</span><span className="font-medium">{withAgent} ({signIns.length ? Math.round((withAgent / signIns.length) * 100) : 0}%)</span></div>
          <Separator />
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Pre-approved buyers</span><span className="font-medium">{preApproved} ({signIns.length ? Math.round((preApproved / signIns.length) * 100) : 0}%)</span></div>
          <Separator />
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Very interested</span><span className="font-medium">{hotLeads.length} ({signIns.length ? Math.round((hotLeads.length / signIns.length) * 100) : 0}%)</span></div>
          <Separator />
          <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Warm leads</span><span className="font-medium">{warmLeads.length} ({signIns.length ? Math.round((warmLeads.length / signIns.length) * 100) : 0}%)</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Seller Talking Points</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {sellerTalkingPoints.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border/50 bg-background/70 p-4">
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Lead Attribution</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Separate live open house traffic from leads captured later through the reusable public link so the seller can see whether interest kept building after the doors closed.</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">On-site open house captures</span><span className="font-medium">{openHouseCaptures} ({onSiteShare}%)</span></div>
              <div className="h-2 rounded-full bg-muted/40"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${signIns.length ? (openHouseCaptures / signIns.length) * 100 : 0}%` }} /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Reusable-link listing inquiries</span><span className="font-medium">{listingInquiryCaptures} ({inquiryShare}%)</span></div>
              <div className="h-2 rounded-full bg-muted/40"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500" style={{ width: `${signIns.length ? (listingInquiryCaptures / signIns.length) * 100 : 0}%` }} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(hourMap).length > 0 ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Live Open House Traffic Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(hourMap).map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">{hour}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted/30">
                    <div className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 pr-2" style={{ width: `${Math.max(20, (count / Math.max(...Object.values(hourMap))) * 100)}%` }}>
                      <span className="text-xs font-medium text-white">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Visitors ({signIns.length})</CardTitle>
          {isPublic ? (
            <p className="text-sm text-muted-foreground">Shared view keeps visitor phone numbers and email addresses hidden.</p>
          ) : null}
        </CardHeader>
        <CardContent>
          {signIns.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No visitors have signed in yet</p>
          ) : (
            <div className="space-y-3">
              {attributedSignIns.map((s, i) => {
                const contactLine = isPublic
                  ? [maskPhone(s.phone), maskEmail(s.email)].filter(Boolean).join(" · ") || "Contact details hidden"
                  : [s.phone, s.email].filter(Boolean).join(" · ") || "No contact info";
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-medium text-emerald-400">{i + 1}</div>
                      <div>
                        <p className="text-sm font-medium">{s.fullName}</p>
                        <p className="text-xs text-muted-foreground">{contactLine}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.interestLevel === "very" ? <Badge className="border-orange-500/30 bg-orange-500/10 text-xs text-orange-400">HOT</Badge> : null}
                      {s.interestLevel === "somewhat" ? <Badge className="border-yellow-500/30 bg-yellow-500/10 text-xs text-yellow-400">WARM</Badge> : null}
                      {s.isPreApproved === "yes" ? <Badge className="border-blue-500/30 bg-blue-500/10 text-xs text-blue-400">Pre-Approved</Badge> : null}
                      {!s.hasAgent ? <Badge className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400">No Agent</Badge> : null}
                      <Badge variant="secondary" className="text-xs">{formatPublicModeLabel(s.inferredCaptureMode)}</Badge>
                      <span className="text-xs text-muted-foreground">{s.signedInAt ? format(new Date(s.signedInAt), "h:mm a") : ""}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
