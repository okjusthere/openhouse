"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Home, MapPin, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image, { type ImageLoaderProps } from "next/image";

interface EventInfo {
    uuid: string;
    propertyAddress: string;
    listPrice: string | null;
    startTime: string;
    endTime: string;
    status: string;
    branding: { logoUrl?: string; primaryColor?: string; tagline?: string } | null;
    complianceText: string | null;
    customFields: Array<{ label: string; type: "text" | "select"; options?: string[] }> | null;
    propertyType: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    sqft: number | null;
    propertyDescription: string | null;
    aiQaEnabled: boolean;
}

type Phase = "loading" | "form" | "success" | "error";

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

export default function PublicSignInPage({
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const { uuid } = use(params);
    const [phase, setPhase] = useState<Phase>("loading");
    const [event, setEvent] = useState<EventInfo | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [hasAgent, setHasAgent] = useState<string>("");
    const [isPreApproved, setIsPreApproved] = useState("");
    const [interestLevel, setInterestLevel] = useState("");
    const [buyingTimeline, setBuyingTimeline] = useState("");
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`/api/public/event/${uuid}`)
            .then((r) => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then((data) => {
                setEvent(data);
                setPhase("form");
            })
            .catch(() => setPhase("error"));
    }, [uuid]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/public/event/${uuid}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    phone: phone || undefined,
                    email: email || undefined,
                    hasAgent: hasAgent === "yes",
                    isPreApproved: isPreApproved || undefined,
                    interestLevel: interestLevel || undefined,
                    buyingTimeline: buyingTimeline || undefined,
                    customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
                }),
            });
            if (res.ok) {
                setPhase("success");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to sign in");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const primaryColor = event?.branding?.primaryColor || "#10b981";

    if (phase === "loading") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="py-12">
                        <Home className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
                        <p className="text-muted-foreground">
                            This Open House event doesn&apos;t exist or has ended.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (phase === "success") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center border-emerald-500/30">
                    <CardContent className="py-12">
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${primaryColor}20` }}
                        >
                            <CheckCircle2 className="h-8 w-8" style={{ color: primaryColor }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                        <p className="text-muted-foreground mb-4">
                            You&apos;ve been signed in at this Open House. The agent will follow up with you soon.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {event?.propertyAddress}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div
                className="px-6 py-8 text-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05)` }}
            >
                {event?.branding?.logoUrl && (
                    <Image
                        loader={passthroughLoader}
                        unoptimized
                        src={event.branding.logoUrl}
                        alt="Logo"
                        width={192}
                        height={48}
                        className="h-12 w-auto mx-auto mb-3 rounded"
                    />
                )}
                <Badge variant="secondary" className="mb-3 text-xs">
                    Open House Sign-In
                </Badge>
                <h1 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: primaryColor }} />
                    {event?.propertyAddress}
                </h1>
                {event?.listPrice && (
                    <p className="text-lg font-semibold" style={{ color: primaryColor }}>
                        ${Number(event.listPrice).toLocaleString()}
                    </p>
                )}
                {event?.branding?.tagline && (
                    <p className="text-sm text-muted-foreground mt-1">{event.branding.tagline}</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                    {event?.bedrooms && <span>{event.bedrooms} bed</span>}
                    {event?.bathrooms && <span>{event.bathrooms} bath</span>}
                    {event?.sqft && <span>{event.sqft.toLocaleString()} sqft</span>}
                </div>
                {event?.aiQaEnabled && (
                    <Link href={`/oh/${uuid}/chat`} className="inline-block mt-4">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                        >
                            <MessageSquareText className="mr-2 h-4 w-4" />
                            Ask AI About This Home
                        </Button>
                    </Link>
                )}
            </div>

            {/* Form */}
            <div className="max-w-md mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Your Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input
                                    placeholder="John Smith"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    type="tel"
                                    placeholder="(555) 123-4567"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Quick Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label>Are you working with an agent?</Label>
                                <Select value={hasAgent} onValueChange={setHasAgent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="yes">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Are you pre-approved?</Label>
                                <Select value={isPreApproved} onValueChange={setIsPreApproved}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="not_yet">Not yet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>How interested are you?</Label>
                                <Select value={interestLevel} onValueChange={setInterestLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="very">Very Interested</SelectItem>
                                        <SelectItem value="somewhat">Somewhat Interested</SelectItem>
                                        <SelectItem value="just_looking">Just Looking</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Buying timeline?</Label>
                                <Select value={buyingTimeline} onValueChange={setBuyingTimeline}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0_3_months">0–3 months</SelectItem>
                                        <SelectItem value="3_6_months">3–6 months</SelectItem>
                                        <SelectItem value="6_12_months">6–12 months</SelectItem>
                                        <SelectItem value="over_12_months">12+ months</SelectItem>
                                        <SelectItem value="just_browsing">Just browsing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custom Fields */}
                    {event?.customFields && event.customFields.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Additional Questions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {event.customFields.map((field, i) => (
                                    <div key={i} className="space-y-2">
                                        <Label>{field.label}</Label>
                                        {field.type === "select" && field.options ? (
                                            <Select
                                                value={customAnswers[field.label] || ""}
                                                onValueChange={(v) =>
                                                    setCustomAnswers((prev) => ({ ...prev, [field.label]: v }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options.map((opt) => (
                                                        <SelectItem key={opt} value={opt}>
                                                            {opt}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                value={customAnswers[field.label] || ""}
                                                onChange={(e) =>
                                                    setCustomAnswers((prev) => ({
                                                        ...prev,
                                                        [field.label]: e.target.value,
                                                    }))
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Compliance */}
                    {event?.complianceText && (
                        <p className="text-xs text-muted-foreground text-center px-2">
                            {event.complianceText}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
                            color: "white",
                            border: "none",
                        }}
                        disabled={submitting}
                    >
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                    </Button>
                </form>
            </div>
        </div>
    );
}
