"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Plus,
    QrCode,
    Users,
    CalendarDays,
    MoreHorizontal,
    Copy,
    Download,
    ExternalLink,
    Trash2,
    Pencil,
    Flame,
    Loader2,
    FileText,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";

interface OHEvent {
    id: number;
    uuid: string;
    propertyAddress: string;
    mlsNumber: string | null;
    listPrice: string | null;
    startTime: string;
    endTime: string;
    status: string;
    totalSignIns: number;
    hotLeadsCount: number;
    branding: Record<string, string> | null;
    customFields: Array<{ label: string; type: string; options?: string[] }> | null;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-500/10 text-gray-400 border-gray-500/30" },
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    completed: { label: "Completed", className: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
    cancelled: { label: "Cancelled", className: "bg-red-500/10 text-red-400 border-red-500/30" },
};

const STATUS_FILTER = ["all", "draft", "active", "completed", "cancelled"];

export default function EventsPage() {
    const [events, setEvents] = useState<OHEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [address, setAddress] = useState("");
    const [mlsNumber, setMlsNumber] = useState("");
    const [listPrice, setListPrice] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch("/api/events");
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyAddress: address,
                    mlsNumber: mlsNumber || undefined,
                    listPrice: listPrice || undefined,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString(),
                    propertyDescription: description || undefined,
                    status: "active",
                }),
            });
            if (res.ok) {
                toast.success("Open House created!");
                setDialogOpen(false);
                setAddress("");
                setMlsNumber("");
                setListPrice("");
                setStartTime("");
                setEndTime("");
                setDescription("");
                fetchEvents();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to create event");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this event and all its sign-in data?")) return;
        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Event deleted");
                fetchEvents();
            }
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleCopyLink = (uuid: string) => {
        const url = `${window.location.origin}/oh/${uuid}`;
        navigator.clipboard.writeText(url);
        toast.success("Sign-in link copied!");
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await fetch(`/api/events/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            toast.success(`Status updated to ${status}`);
            fetchEvents();
        } catch {
            toast.error("Failed to update");
        }
    };

    const filteredEvents = filter === "all"
        ? events
        : events.filter((e) => e.status === filter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Open Houses</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your Open House events
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0">
                            <Plus className="mr-2 h-4 w-4" />
                            New Open House
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Open House</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label>Property Address *</Label>
                                <Input
                                    placeholder="123 Main St, City, State ZIP"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>MLS #</Label>
                                    <Input
                                        placeholder="Optional"
                                        value={mlsNumber}
                                        onChange={(e) => setMlsNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>List Price</Label>
                                    <Input
                                        placeholder="$450,000"
                                        value={listPrice}
                                        onChange={(e) => setListPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Tell visitors about this property..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                                disabled={creating}
                            >
                                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Open House
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {STATUS_FILTER.map((s) => (
                    <Button
                        key={s}
                        variant={filter === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(s)}
                        className={filter === s ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : ""}
                    >
                        {s === "all" ? "All" : STATUS_BADGE[s]?.label || s}
                    </Button>
                ))}
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                </div>
            ) : filteredEvents.length === 0 ? (
                <Card className="border-dashed border-border/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No events yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Create your first Open House to start capturing leads
                        </p>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Open House
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="border-border/50 hover:border-emerald-500/20 transition-colors">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-base truncate">
                                                {event.propertyAddress}
                                            </h3>
                                            <Badge className={STATUS_BADGE[event.status]?.className || ""}>
                                                {STATUS_BADGE[event.status]?.label || event.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {format(new Date(event.startTime), "MMM d, yyyy h:mm a")}
                                            </span>
                                            {event.mlsNumber && (
                                                <span>MLS# {event.mlsNumber}</span>
                                            )}
                                            {event.listPrice && (
                                                <span>${Number(event.listPrice).toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 mr-4">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-lg font-bold">
                                                <Users className="h-4 w-4 text-emerald-400" />
                                                {event.totalSignIns}
                                            </div>
                                            <span className="text-xs text-muted-foreground">Sign-ins</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-lg font-bold">
                                                <Flame className="h-4 w-4 text-orange-400" />
                                                {event.hotLeadsCount}
                                            </div>
                                            <span className="text-xs text-muted-foreground">Hot Leads</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="shrink-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleCopyLink(event.uuid)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Sign-in Link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/oh/${event.uuid}`} target="_blank">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Open Sign-in Page
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/oh/${event.uuid}/kiosk`} target="_blank">
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    Kiosk Mode
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/events/${event.id}`}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/events/${event.id}/report`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Seller Report
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => window.open(`/api/events/${event.id}/export/csv`)}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Export CSV
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {event.status === "draft" && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(event.id, "active")}>
                                                    Set Active
                                                </DropdownMenuItem>
                                            )}
                                            {event.status === "active" && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(event.id, "completed")}>
                                                    Mark Completed
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(event.id)}
                                                className="text-red-400"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
