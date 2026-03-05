"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    ArrowLeft,
    Users,
    QrCode,
    ExternalLink,
    Copy,
    Save,
    Flame,
    CalendarDays,
    Download,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

interface SignIn {
    id: number;
    fullName: string;
    phone: string | null;
    email: string | null;
    hasAgent: boolean;
    isPreApproved: string | null;
    interestLevel: string | null;
    buyingTimeline: string | null;
    leadTier: string | null;
    signedInAt: string;
}

interface EventDetail {
    id: number;
    uuid: string;
    propertyAddress: string;
    mlsNumber: string | null;
    listPrice: string | null;
    propertyDescription: string | null;
    startTime: string;
    endTime: string;
    status: string;
    totalSignIns: number;
    hotLeadsCount: number;
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    sqft: number | null;
    complianceText: string | null;
    signIns: SignIn[];
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-500/10 text-gray-400 border-gray-500/30" },
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    completed: { label: "Completed", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-400 border-red-500/30" },
};

const INTEREST_BADGE: Record<string, { label: string; className: string }> = {
    very: { label: "🔥 Hot", className: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
    somewhat: { label: "⚡ Warm", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
    just_looking: { label: "👀 Looking", className: "bg-gray-500/10 text-gray-400 border-gray-500/30" },
};

export default function EventDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    // Edit form
    const [address, setAddress] = useState("");
    const [mlsNumber, setMlsNumber] = useState("");
    const [listPrice, setListPrice] = useState("");
    const [description, setDescription] = useState("");
    const [complianceText, setComplianceText] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("");

    const fetchEvent = useCallback(async () => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
                setAddress(data.propertyAddress);
                setMlsNumber(data.mlsNumber || "");
                setListPrice(data.listPrice || "");
                setDescription(data.propertyDescription || "");
                setComplianceText(data.complianceText || "");
                setStartTime(data.startTime ? format(new Date(data.startTime), "yyyy-MM-dd'T'HH:mm") : "");
                setEndTime(data.endTime ? format(new Date(data.endTime), "yyyy-MM-dd'T'HH:mm") : "");
                setStatus(data.status);
            }
        } catch {
            toast.error("Failed to load event");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchEvent(); }, [fetchEvent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyAddress: address,
                    mlsNumber: mlsNumber || null,
                    listPrice: listPrice || null,
                    propertyDescription: description || null,
                    complianceText: complianceText || null,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    status,
                }),
            });
            if (res.ok) {
                toast.success("Event updated");
                setEditing(false);
                fetchEvent();
            }
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleCopyLink = () => {
        if (!event) return;
        navigator.clipboard.writeText(`${window.location.origin}/oh/${event.uuid}`);
        toast.success("Sign-in link copied!");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    if (!event) {
        return <div className="text-center py-20"><p className="text-muted-foreground">Event not found</p></div>;
    }

    const signIns = event.signIns || [];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/events">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{event.propertyAddress}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={STATUS_BADGE[event.status]?.className || ""}>
                                {STATUS_BADGE[event.status]?.label || event.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {format(new Date(event.startTime), "MMM d, yyyy h:mm a")}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                        <Copy className="mr-2 h-4 w-4" />Copy Link
                    </Button>
                    <Link href={`/oh/${event.uuid}`} target="_blank">
                        <Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" />Sign-in Page</Button>
                    </Link>
                    <Link href={`/oh/${event.uuid}/kiosk`} target="_blank">
                        <Button variant="outline" size="sm"><QrCode className="mr-2 h-4 w-4" />Kiosk</Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Users className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{signIns.length}</div>
                            <div className="text-xs text-muted-foreground">Sign-ins</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                            <Flame className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {signIns.filter((s) => s.interestLevel === "very").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Hot Leads</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <CalendarDays className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {signIns.filter((s) => s.isPreApproved === "yes").length}
                            </div>
                            <div className="text-xs text-muted-foreground">Pre-Approved</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit / View Event Details */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Event Details</CardTitle>
                    {editing ? (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                                {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                <Save className="mr-2 h-3 w-3" /> Save
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {editing ? (
                        <>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>MLS #</Label>
                                    <Input value={mlsNumber} onChange={(e) => setMlsNumber(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>List Price</Label>
                                    <Input value={listPrice} onChange={(e) => setListPrice(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Compliance Text</Label>
                                <Textarea value={complianceText} onChange={(e) => setComplianceText(e.target.value)} rows={2} />
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted-foreground">MLS #:</span> {event.mlsNumber || "—"}</div>
                            <div><span className="text-muted-foreground">Price:</span> {event.listPrice ? `$${Number(event.listPrice).toLocaleString()}` : "—"}</div>
                            <div><span className="text-muted-foreground">Type:</span> {event.propertyType || "—"}</div>
                            <div><span className="text-muted-foreground">Beds/Baths:</span> {event.bedrooms || "—"}/{event.bathrooms || "—"}</div>
                            <div><span className="text-muted-foreground">Sqft:</span> {event.sqft?.toLocaleString() || "—"}</div>
                            <div><span className="text-muted-foreground">Status:</span> {event.status}</div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sign-ins Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Sign-ins ({signIns.length})</CardTitle>
                    <div className="flex gap-2">
                        <Link href={`/dashboard/events/${id}/report`}>
                            <Button variant="outline" size="sm">Seller Report</Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => window.open(`/api/events/${id}/export/csv`)}>
                            <Download className="mr-2 h-4 w-4" />CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {signIns.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No sign-ins yet. Share the sign-in link or start Kiosk mode.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {signIns.map((s) => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-emerald-500/20 transition-colors">
                                    <div>
                                        <p className="font-medium text-sm">{s.fullName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {[s.phone, s.email].filter(Boolean).join(" · ")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {s.interestLevel && INTEREST_BADGE[s.interestLevel] && (
                                            <Badge className={INTEREST_BADGE[s.interestLevel].className + " text-xs"}>
                                                {INTEREST_BADGE[s.interestLevel].label}
                                            </Badge>
                                        )}
                                        {s.isPreApproved === "yes" && (
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">Pre-Approved</Badge>
                                        )}
                                        {!s.hasAgent && (
                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">No Agent</Badge>
                                        )}
                                        <span className="text-xs text-muted-foreground ml-2">
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
