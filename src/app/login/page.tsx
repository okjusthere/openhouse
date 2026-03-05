"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Sparkles, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            if (res?.error) {
                toast.error("Invalid email or password");
            } else {
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
                <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[110px]" />
                <div className="absolute right-[-10rem] top-[16rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-[100px]" />
                <div className="absolute left-[-8rem] top-[26rem] h-[20rem] w-[20rem] rounded-full bg-teal-500/10 blur-[90px]" />
            </div>

            <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-5 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="hidden lg:block">
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                        OpenHouse Control Center
                    </Badge>
                    <h1
                        className="mt-6 max-w-2xl text-5xl font-semibold leading-tight tracking-tight"
                        style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
                    >
                        Sign in and run your next open house like an operations team.
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                        From first visitor check-in to AI-prioritized follow-up, your workflow stays in one
                        place with report-ready output for sellers and team leads.
                    </p>

                    <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
                        {[
                            { label: "Live lead tiering", icon: Sparkles },
                            { label: "Branded event capture", icon: Building2 },
                            { label: "AI-native follow-up", icon: ChevronRight },
                            { label: "Review-first controls", icon: ShieldCheck },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/45 px-4 py-3 text-sm text-muted-foreground"
                            >
                                <item.icon className="h-4 w-4 text-emerald-700" />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <Card className="w-full border-border/60 bg-card/85 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl lg:max-w-md lg:justify-self-end">
                    <CardHeader className="space-y-3 pb-3 text-center">
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
                            Welcome back
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Access your events, leads, and post-open-house AI workflows.
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
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
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="h-11 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                                Create one
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
