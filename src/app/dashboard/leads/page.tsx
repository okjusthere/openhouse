"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Users,
    Flame,
    Zap,
    Eye,
    Search,
    Download,
    Loader2,
    Sparkles,
    Mail,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LeadData {
    id: number;
    fullName: string;
    phone: string | null;
    email: string | null;
    hasAgent: boolean;
    isPreApproved: string | null;
    interestLevel: string | null;
    buyingTimeline: string | null;
    leadTier: string | null;
    leadScore: {
        overallScore: number;
        buyReadiness: number;
        financialStrength: number;
        engagementLevel: number;
        urgency: number;
        tier: string;
        recommendation: string;
    } | null;
    pdlEnriched: boolean;
    pdlData: {
        job_title?: string;
        job_company_name?: string;
        linkedin_url?: string;
    } | null;
    aiRecommendation: string | null;
    followUpSent: boolean;
    signedInAt: string;
    eventId: number;
}

interface EventData {
    id: number;
    propertyAddress: string;
    signIns: LeadData[];
}

const TIER_STYLE: Record<string, { label: string; icon: typeof Flame; className: string }> = {
    hot: { label: "Hot", icon: Flame, className: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
    warm: { label: "Warm", icon: Zap, className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    cold: { label: "Cold", icon: Eye, className: "bg-gray-500/10 text-gray-400 border-gray-500/30" },
};

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
            />
        </div>
    );
}

export default function LeadsPage() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("all");
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchLeads = useCallback(async () => {
        try {
            const res = await fetch("/api/events");
            if (res.ok) {
                const eventsList = await res.json();
                // Fetch sign-ins for each event
                const enriched = await Promise.all(
                    eventsList.map(async (evt: { id: number; propertyAddress: string }) => {
                        const r = await fetch(`/api/events/${evt.id}`);
                        if (r.ok) return r.json();
                        return { ...evt, signIns: [] };
                    })
                );
                setEvents(enriched);
            }
        } catch {
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(); }, [fetchLeads]);

    const allLeads = events.flatMap((evt) =>
        (evt.signIns || []).map((s: LeadData) => ({ ...s, eventId: evt.id, propertyAddress: evt.propertyAddress }))
    );

    const filteredLeads = allLeads
        .filter((l) => {
            if (tierFilter !== "all" && l.leadTier !== tierFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return l.fullName.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q);
            }
            return true;
        })
        .sort((a, b) => (b.leadScore?.overallScore || 0) - (a.leadScore?.overallScore || 0));

    const hotCount = allLeads.filter((l) => l.leadTier === "hot").length;
    const warmCount = allLeads.filter((l) => l.leadTier === "warm").length;
    const coldCount = allLeads.filter((l) => l.leadTier === "cold" || !l.leadTier).length;

    const handleProcessLead = async (eventId: number, signInId: number) => {
        setProcessingId(signInId);
        try {
            const res = await fetch(`/api/events/${eventId}/process-signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signInId }),
            });
            if (res.ok) {
                toast.success("Lead scored successfully!");
                fetchLeads();
            } else {
                const err = await res.json();
                toast.error(err.error || "Scoring failed");
            }
        } catch {
            toast.error("Failed to process lead");
        } finally {
            setProcessingId(null);
        }
    };

    const handleFollowUp = async (eventId: number, signInId: number) => {
        try {
            const res = await fetch(`/api/events/${eventId}/follow-up`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signInId }),
            });
            if (res.ok) {
                toast.success("Follow-up email generated!");
                fetchLeads();
            }
        } catch {
            toast.error("Failed to generate follow-up");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
                <p className="text-muted-foreground mt-1">All visitors across your Open Houses</p>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Users className="h-5 w-5 text-emerald-400" />
                        <div>
                            <div className="text-2xl font-bold">{allLeads.length}</div>
                            <div className="text-xs text-muted-foreground">Total Leads</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Flame className="h-5 w-5 text-orange-400" />
                        <div>
                            <div className="text-2xl font-bold">{hotCount}</div>
                            <div className="text-xs text-muted-foreground">Hot</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        <div>
                            <div className="text-2xl font-bold">{warmCount}</div>
                            <div className="text-xs text-muted-foreground">Warm</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <Eye className="h-5 w-5 text-gray-400" />
                        <div>
                            <div className="text-2xl font-bold">{coldCount}</div>
                            <div className="text-xs text-muted-foreground">Cold</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="hot">🔥 Hot</SelectItem>
                        <SelectItem value="warm">⚡ Warm</SelectItem>
                        <SelectItem value="cold">👀 Cold</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Leads List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                </div>
            ) : filteredLeads.length === 0 ? (
                <Card className="border-dashed border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No leads yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Leads will appear here once visitors sign in at your Open Houses
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLeads.map((lead) => {
                        const tierInfo = TIER_STYLE[lead.leadTier || "cold"] || TIER_STYLE.cold;
                        const TierIcon = tierInfo.icon;
                        const score = lead.leadScore;

                        return (
                            <Card key={lead.id} className="border-border/50 hover:border-emerald-500/20 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Score Circle */}
                                        <div className="flex flex-col items-center gap-1 w-14">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                                                style={{
                                                    background: `conic-gradient(${lead.leadTier === "hot" ? "#f97316" : lead.leadTier === "warm" ? "#eab308" : "#6b7280"
                                                        } ${(score?.overallScore || 0) * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                                                }}
                                            >
                                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm">
                                                    {score?.overallScore || "—"}
                                                </span>
                                            </div>
                                            <Badge className={tierInfo.className + " text-xs px-1.5"}>
                                                <TierIcon className="h-3 w-3 mr-0.5" />
                                                {tierInfo.label}
                                            </Badge>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm">{lead.fullName}</h3>
                                                {lead.pdlEnriched && (
                                                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                                                        PDL ✓
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {[lead.phone, lead.email].filter(Boolean).join(" · ") || "No contact info"}
                                            </p>
                                            {lead.pdlData?.job_title && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {lead.pdlData.job_title}{lead.pdlData.job_company_name ? ` at ${lead.pdlData.job_company_name}` : ""}
                                                </p>
                                            )}

                                            {/* Score Breakdown */}
                                            {score && (
                                                <div className="grid grid-cols-4 gap-2 mt-2">
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Buy Ready</span>
                                                        <ScoreBar value={score.buyReadiness} max={25} color="#10b981" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Financial</span>
                                                        <ScoreBar value={score.financialStrength} max={25} color="#3b82f6" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Engaged</span>
                                                        <ScoreBar value={score.engagementLevel} max={25} color="#8b5cf6" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-muted-foreground">Urgency</span>
                                                        <ScoreBar value={score.urgency} max={25} color="#f97316" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Recommendation */}
                                            {lead.aiRecommendation && (
                                                <p className="text-xs text-emerald-400/80 mt-2 italic">
                                                    💡 {lead.aiRecommendation}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-1.5">
                                            {!score && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleProcessLead(lead.eventId, lead.id)}
                                                    disabled={processingId === lead.id}
                                                >
                                                    {processingId === lead.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    ) : (
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                    )}
                                                    Score
                                                </Button>
                                            )}
                                            {lead.email && !lead.followUpSent && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => handleFollowUp(lead.eventId, lead.id)}
                                                >
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    Follow Up
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
