"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Loader2, CheckCircle2, Home, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { OptionButtonGroup } from "@/components/ui/option-button-group";
import { BrandLockup } from "@/components/brand-lockup";
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
    branding: { logoUrl?: string; primaryColor?: string; tagline?: string; flyerImageUrl?: string } | null;
    customFields: Array<{ label: string; type: "text" | "select"; options?: string[] }> | null;
    complianceText: string | null;
    bedrooms: number | null;
    bathrooms: string | null;
    sqft: number | null;
    propertyPhotos: string[] | null;
    propertyDescription: string | null;
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
    const heroImage = event?.propertyPhotos?.[0] || event?.branding?.flyerImageUrl || null;

    if (phase === "loading") {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color }} />
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-8 text-center">
                <div>
                    <Home className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                    <h1 className="mb-2 text-2xl font-bold">Event Not Found</h1>
                    <p className="text-muted-foreground">This Open House event doesn&apos;t exist.</p>
                </div>
            </div>
        );
    }

    // WELCOME SCREEN
    if (phase === "welcome") {
        return (
            <div
                className="fixed inset-0 cursor-pointer bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-8 text-center"
                onClick={() => setPhase("form")}
            >
                <div className="mx-auto flex h-full w-full max-w-4xl items-center justify-center">
                    <div className="w-full rounded-[2rem] border border-border/60 bg-white/92 px-10 py-12 shadow-2xl shadow-emerald-900/5 backdrop-blur">
                        {heroImage && (
                            <Image
                                loader={passthroughLoader}
                                unoptimized
                                src={heroImage}
                                alt={event?.propertyAddress || "Property photo"}
                                width={1440}
                                height={720}
                                className="mb-6 h-52 w-full rounded-[1.5rem] object-cover"
                            />
                        )}
                        {event?.branding?.logoUrl && (
                            <Image
                                loader={passthroughLoader}
                                unoptimized
                                src={event.branding.logoUrl}
                                alt="Logo"
                                width={240}
                                height={64}
                                className="mb-6 h-16 w-auto rounded-lg"
                            />
                        )}
                        <div className="mb-4">
                            <BrandLockup compact />
                        </div>
                        <div
                            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl text-5xl"
                            style={{ backgroundColor: `${color}18` }}
                        >
                            🏠
                        </div>
                        <h1 className="mb-3 text-4xl font-bold">Welcome!</h1>
                        <p className="mb-2 inline-flex items-center gap-2 text-xl">
                            <MapPin className="h-5 w-5" style={{ color }} />
                            {event?.propertyAddress}
                        </p>
                        {event?.listPrice && (
                            <p className="mb-4 text-2xl font-bold" style={{ color }}>
                                ${Number(event.listPrice).toLocaleString()}
                            </p>
                        )}
                        {event?.branding?.tagline && (
                            <p className="mb-8 text-muted-foreground">{event.branding.tagline}</p>
                        )}
                        {event?.propertyDescription && (
                            <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {event.propertyDescription}
                            </p>
                        )}
                        <div
                            className="mx-auto inline-flex rounded-2xl px-10 py-4 text-xl font-semibold text-white animate-pulse"
                            style={{ backgroundColor: color }}
                        >
                            Tap to Sign In
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // THANK YOU SCREEN
    if (phase === "thanks") {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-8 text-center">
                <div className="mx-auto flex h-full w-full max-w-3xl items-center justify-center">
                    <div className="w-full rounded-[2rem] border border-border/60 bg-white/92 px-10 py-12 shadow-2xl shadow-emerald-900/5 backdrop-blur">
                        <div
                            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${color}18` }}
                        >
                            <CheckCircle2 className="h-10 w-10" style={{ color }} />
                        </div>
                        <h1 className="mb-3 text-4xl font-bold">Thank You!</h1>
                        <p className="text-xl text-muted-foreground">Enjoy the Open House</p>
                        <p className="mt-4 text-sm text-muted-foreground">Next visitor in a moment...</p>
                    </div>
                </div>
            </div>
        );
    }

    // FORM SCREEN
    return (
        <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
            <div className="mx-auto max-w-lg px-6 py-8">
                {/* Header */}
                <div className="mb-6 text-center">
                    {heroImage && (
                        <Image
                            loader={passthroughLoader}
                            unoptimized
                            src={heroImage}
                            alt={event?.propertyAddress || "Property photo"}
                            width={1200}
                            height={640}
                            className="mb-5 h-44 w-full rounded-[1.5rem] object-cover shadow-lg shadow-emerald-900/8"
                        />
                    )}
                    <div className="mb-3 inline-flex rounded-full border border-border/60 bg-background/70 px-3 py-1.5">
                        <BrandLockup compact />
                    </div>
                    <h1 className="mb-1 text-2xl font-bold">Sign In</h1>
                    <p className="text-sm text-muted-foreground">{event?.propertyAddress}</p>
                    {event?.propertyDescription && (
                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                            {event.propertyDescription}
                        </p>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-[1.75rem] border border-border/60 bg-white/92 p-6 shadow-2xl shadow-emerald-900/5 backdrop-blur"
                >
                    <div>
                        <label className="mb-1.5 block text-sm text-foreground/90">Full Name *</label>
                        <Input
                            className="h-14 border-border/70 bg-white text-lg"
                            placeholder="Your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-foreground/90">Phone</label>
                        <Input
                            className="h-14 border-border/70 bg-white text-lg"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm text-foreground/90">Email</label>
                        <Input
                            className="h-14 border-border/70 bg-white text-lg"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm text-foreground/90">Working with an agent?</label>
                            <OptionButtonGroup
                                value={hasAgent}
                                onChange={setHasAgent}
                                accentColor={color}
                                options={[
                                    { value: "no", label: "No" },
                                    { value: "yes", label: "Yes" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-foreground/90">Pre-approved?</label>
                            <OptionButtonGroup
                                value={isPreApproved}
                                onChange={setIsPreApproved}
                                accentColor={color}
                                options={[
                                    { value: "yes", label: "Yes" },
                                    { value: "no", label: "No" },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm text-foreground/90">Interest level</label>
                        <OptionButtonGroup
                            value={interestLevel}
                            onChange={setInterestLevel}
                            accentColor={color}
                            options={[
                                { value: "very", label: "Very Interested" },
                                { value: "somewhat", label: "Somewhat Interested" },
                                { value: "just_looking", label: "Just Looking" },
                            ]}
                        />
                    </div>

                    {/* Custom Fields */}
                    {event?.customFields?.map((field, i) => (
                        <div key={i}>
                            <label className="mb-1.5 block text-sm text-foreground/90">{field.label}</label>
                            {field.type === "select" && field.options ? (
                                <OptionButtonGroup
                                    value={customAnswers[field.label] || ""}
                                    onChange={(nextValue) =>
                                        setCustomAnswers((prev) => ({ ...prev, [field.label]: nextValue }))
                                    }
                                    accentColor={color}
                                    options={field.options.map((opt) => ({ value: opt, label: opt }))}
                                />
                            ) : (
                                <Input
                                    className="h-12 border-border/70 bg-white"
                                    value={customAnswers[field.label] || ""}
                                    onChange={(e) => setCustomAnswers((prev) => ({ ...prev, [field.label]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}

                    {event?.complianceText && (
                        <p className="text-center text-xs text-muted-foreground">{event.complianceText}</p>
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
                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
