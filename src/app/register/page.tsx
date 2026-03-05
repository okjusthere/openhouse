"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
    Brain,
    Building2,
    ChevronRight,
    Loader2,
    ScanLine,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const BRAND_FEATURES = [
    { label: "Branded QR + kiosk capture", icon: ScanLine },
    { label: "AI-native lead prioritization", icon: Brain },
    { label: "Seller-ready reporting flow", icon: Building2 },
    { label: "Human-review guardrails", icon: ShieldCheck },
];

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [brokerageName, setBrokerageName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    phone: phone || undefined,
                    licenseNumber: licenseNumber || undefined,
                    brokerageName: brokerageName || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Registration failed");
                return;
            }

            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (signInRes?.error) {
                toast.success("Account created. Please sign in.");
                router.push("/login");
            } else {
                toast.success("Welcome to OpenHouse.");
                router.push("/dashboard");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        await signIn("google", { callbackUrl: "/dashboard" });
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-[-20rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[110px]" />
                <div className="absolute right-[-10rem] top-[18rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[100px]" />
                <div className="absolute left-[-8rem] top-[26rem] h-[22rem] w-[22rem] rounded-full bg-teal-500/10 blur-[95px]" />
            </div>

            <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1.02fr_0.98fr]">
                <section className="hidden lg:block">
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                        Brokerage onboarding
                    </Badge>
                    <h1
                        className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
                    >
                        Launch a modern open house workflow in one afternoon.
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                        OpenHouse gives North American agents a consistent, AI-native operating loop from
                        first visitor sign-in to seller-facing summary.
                    </p>

                    <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
                        {BRAND_FEATURES.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/45 px-4 py-3 text-sm text-muted-foreground"
                            >
                                <item.icon className="h-4 w-4 text-emerald-700" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/45 px-3 py-1.5 text-xs text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                        Free tier for launch. Pro tier for AI-first qualification at scale.
                    </p>
                </section>

                <Card className="w-full border-border/60 bg-card/85 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl lg:max-w-lg lg:justify-self-end">
                    <CardHeader className="space-y-3 pb-2 text-center">
                        <Link href="/" className="inline-flex items-center justify-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                                OH
                            </div>
                            <div className="text-left leading-tight">
                                <p className="text-sm font-semibold">OpenHouse</p>
                                <p className="text-[11px] text-muted-foreground">Agent growth platform</p>
                            </div>
                        </Link>

                        <CardTitle
                            className="text-3xl tracking-tight"
                            style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
                        >
                            Create your account
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Start free. Upgrade to Pro when you need advanced AI workflows.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="h-11 w-full border-border/70 bg-background/60"
                            onClick={handleGoogle}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <Separator className="bg-border/60" />
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                or
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Jane Smith"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Work email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@brokerage.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="(555) 123-4567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="license">License #</Label>
                                    <Input
                                        id="license"
                                        placeholder="Optional"
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brokerage">Brokerage</Label>
                                    <Input
                                        id="brokerage"
                                        placeholder="Optional"
                                        value={brokerageName}
                                        onChange={(e) => setBrokerageName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-11 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create account
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
