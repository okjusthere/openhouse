"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Loader2, CheckCircle2, Home, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image, { type ImageLoaderProps } from "next/image";

/**
 * iPad Kiosk Mode — Full-screen loop:
 * Welcome → Sign-In Form → Thank You (3s) → Loop back
 * Route: /oh/:uuid/kiosk
 */

interface EventInfo {
    uuid: string;
    propertyAddress: string;
    listPrice: string | null;
    branding: { logoUrl?: string; primaryColor?: string; tagline?: string } | null;
    customFields: Array<{ label: string; type: "text" | "select"; options?: string[] }> | null;
    complianceText: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    sqft: number | null;
}

type Phase = "loading" | "welcome" | "form" | "thanks" | "error";

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

export default function KioskPage({
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
    const [hasAgent, setHasAgent] = useState("");
    const [isPreApproved, setIsPreApproved] = useState("");
    const [interestLevel, setInterestLevel] = useState("");
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`/api/public/event/${uuid}`)
            .then((r) => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then((data) => {
                setEvent(data);
                setPhase("welcome");
            })
            .catch(() => setPhase("error"));
    }, [uuid]);

    const resetForm = useCallback(() => {
        setFullName("");
        setPhone("");
        setEmail("");
        setHasAgent("");
        setIsPreApproved("");
        setInterestLevel("");
        setCustomAnswers({});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) return;
        setSubmitting(true);
        try {
            await fetch(`/api/public/event/${uuid}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    phone: phone || undefined,
                    email: email || undefined,
                    hasAgent: hasAgent === "yes",
                    isPreApproved: isPreApproved || undefined,
                    interestLevel: interestLevel || undefined,
                    customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
                }),
            });
            setPhase("thanks");
            resetForm();
            // Auto-loop back to welcome after 3 seconds
            setTimeout(() => setPhase("welcome"), 3000);
        } catch {
            // Still show thanks even on error
            setPhase("thanks");
            resetForm();
            setTimeout(() => setPhase("welcome"), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    const color = event?.branding?.primaryColor || "#10b981";

    if (phase === "loading") {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color }} />
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center text-center px-8">
                <div>
                    <Home className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Event Not Found</h1>
                    <p className="text-gray-400">This Open House event doesn&apos;t exist.</p>
                </div>
            </div>
        );
    }

    // WELCOME SCREEN
    if (phase === "welcome") {
        return (
            <div
                className="fixed inset-0 flex flex-col items-center justify-center text-center px-8 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${color}15, black 60%)` }}
                onClick={() => setPhase("form")}
            >
                {event?.branding?.logoUrl && (
                    <Image
                        loader={passthroughLoader}
                        unoptimized
                        src={event.branding.logoUrl}
                        alt="Logo"
                        width={240}
                        height={64}
                        className="h-16 w-auto mb-6 rounded-lg"
                    />
                )}
                <div
                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl text-5xl"
                    style={{ backgroundColor: `${color}20` }}
                >
                    🏠
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">Welcome!</h1>
                <p className="text-xl text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color }} />
                    {event?.propertyAddress}
                </p>
                {event?.listPrice && (
                    <p className="text-2xl font-bold mb-4" style={{ color }}>
                        ${Number(event.listPrice).toLocaleString()}
                    </p>
                )}
                {event?.branding?.tagline && (
                    <p className="text-gray-400 mb-8">{event.branding.tagline}</p>
                )}
                <div
                    className="px-10 py-4 rounded-2xl text-xl font-semibold text-white animate-pulse"
                    style={{ backgroundColor: color }}
                >
                    Tap to Sign In
                </div>
            </div>
        );
    }

    // THANK YOU SCREEN
    if (phase === "thanks") {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center px-8">
                <div
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <CheckCircle2 className="h-10 w-10" style={{ color }} />
                </div>
                <h1 className="text-4xl font-bold text-white mb-3">Thank You!</h1>
                <p className="text-xl text-gray-300">Enjoy the Open House</p>
                <p className="text-sm text-gray-500 mt-4">Next visitor in a moment...</p>
            </div>
        );
    }

    // FORM SCREEN
    return (
        <div className="fixed inset-0 bg-black overflow-auto">
            <div className="max-w-lg mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
                    <p className="text-gray-400 text-sm">{event?.propertyAddress}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-300 mb-1.5 block">Full Name *</label>
                        <Input
                            className="h-14 text-lg bg-gray-900 border-gray-700 text-white"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300 mb-1.5 block">Phone</label>
                        <Input
                            className="h-14 text-lg bg-gray-900 border-gray-700 text-white"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300 mb-1.5 block">Email</label>
                        <Input
                            className="h-14 text-lg bg-gray-900 border-gray-700 text-white"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-gray-300 mb-1.5 block">Working with an agent?</label>
                            <Select value={hasAgent} onValueChange={setHasAgent}>
                                <SelectTrigger className="h-12 bg-gray-900 border-gray-700 text-white">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="yes">Yes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 mb-1.5 block">Pre-approved?</label>
                            <Select value={isPreApproved} onValueChange={setIsPreApproved}>
                                <SelectTrigger className="h-12 bg-gray-900 border-gray-700 text-white">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                    <SelectItem value="not_yet">Not yet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-300 mb-1.5 block">Interest level</label>
                        <Select value={interestLevel} onValueChange={setInterestLevel}>
                            <SelectTrigger className="h-12 bg-gray-900 border-gray-700 text-white">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="very">Very Interested</SelectItem>
                                <SelectItem value="somewhat">Somewhat Interested</SelectItem>
                                <SelectItem value="just_looking">Just Looking</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Fields */}
                    {event?.customFields?.map((field, i) => (
                        <div key={i}>
                            <label className="text-sm text-gray-300 mb-1.5 block">{field.label}</label>
                            {field.type === "select" && field.options ? (
                                <Select
                                    value={customAnswers[field.label] || ""}
                                    onValueChange={(v) => setCustomAnswers((prev) => ({ ...prev, [field.label]: v }))}
                                >
                                    <SelectTrigger className="h-12 bg-gray-900 border-gray-700 text-white">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options.map((opt) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    className="h-12 bg-gray-900 border-gray-700 text-white"
                                    value={customAnswers[field.label] || ""}
                                    onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [field.label]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}

                    {event?.complianceText && (
                        <p className="text-xs text-gray-500 text-center">{event.complianceText}</p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !fullName.trim()}
                        className="w-full h-16 rounded-xl text-xl font-bold text-white disabled:opacity-50 transition-opacity"
                        style={{ backgroundColor: color }}
                    >
                        {submitting ? (
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        ) : (
                            "Submit"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setPhase("welcome");
                        }}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-300"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
