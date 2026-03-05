"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QrCode,
  Brain,
  BarChart3,
  Zap,
  Shield,
  Smartphone,
  MessageSquareText,
  UserCheck,
  Star,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Code Sign-In",
    desc: "Visitors scan and sign in from their phone. No app download needed.",
  },
  {
    icon: Brain,
    title: "AI Lead Scoring",
    desc: "Instantly know which visitors are hot leads with AI-powered scoring.",
    pro: true,
  },
  {
    icon: UserCheck,
    title: "People Data Lab Enrichment",
    desc: "Auto-enrich leads with job title, company, income signals, and social profiles.",
    pro: true,
  },
  {
    icon: MessageSquareText,
    title: "AI Property Q&A",
    desc: "Visitors ask questions about the property and get instant AI answers.",
    pro: true,
  },
  {
    icon: Zap,
    title: "Automated Follow-up",
    desc: "AI generates personalized follow-up emails based on each visitor's profile.",
    pro: true,
  },
  {
    icon: Smartphone,
    title: "iPad Kiosk Mode",
    desc: "Full-screen kiosk loop: Welcome → Sign-in → Thank You → Repeat.",
  },
  {
    icon: BarChart3,
    title: "Seller Reports",
    desc: "Professional reports to wow your sellers with open house analytics.",
  },
  {
    icon: Shield,
    title: "CRM Integration",
    desc: "Seamlessly sync leads to Kevv CRM, Follow Up Boss, or via Zapier.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    features: [
      "3 Open Houses / month",
      "50 Sign-ins / month",
      "QR Code + Kiosk Mode",
      "PDF Flyer Generator",
      "Basic Seller Report",
      "CSV Export",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For serious agents who want AI superpowers",
    features: [
      "Unlimited Open Houses",
      "Unlimited Sign-ins",
      "AI Lead Scoring",
      "100 PDL Enrichments / mo",
      "AI Property Q&A (500/mo)",
      "AI Follow-up Emails",
      "Detailed Seller Reports",
      "CRM Integration (Zapier + API)",
      "Priority Support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
              OH
            </div>
            <span className="text-xl font-bold tracking-tight">OpenHouse Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[40%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            AI-Powered Open House Platform
          </Badge>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Turn Every Open House Into a{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Lead Machine
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Stop using paper sign-in sheets. Capture visitor info with QR codes,
            score leads with AI, enrich contacts with real data, and auto-generate
            follow-ups — all in one platform built for real estate agents.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25"
              >
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                See Features
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Free forever · No credit card required · Set up in 60 seconds
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/40 bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Avg. leads per open house", value: "23x", sub: "more than paper" },
              { label: "AI lead scoring accuracy", value: "94%", sub: "precision rate" },
              { label: "Time saved on follow-ups", value: "3hrs", sub: "per open house" },
              { label: "Agent satisfaction", value: "4.9", sub: "out of 5 stars" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-emerald-400">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Crush Open Houses
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From QR code sign-in to AI-powered lead intelligence — one platform for the entire open house lifecycle.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:border-emerald-500/30 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {f.title}
                    {f.pro && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
                        PRO
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Set Up in 3 Steps
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Your Open House",
                desc: "Enter the property address, set the date and time, customize your branding.",
              },
              {
                step: "2",
                title: "Share the QR Code",
                desc: "Print the auto-generated flyer or display the QR code on your iPad in Kiosk mode.",
              },
              {
                step: "3",
                title: "Let AI Do the Rest",
                desc: "AI scores every lead, enriches their profile, and sends personalized follow-ups.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free. Upgrade when you need AI superpowers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden ${plan.highlight
                    ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-105"
                    : "border-border/50"
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.highlight && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <Star className="mr-1 h-3 w-3" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-6">
                    <Button
                      className={`w-full ${plan.highlight
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                          : ""
                        }`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            PDL enrichment overage: $0.30 per additional lookup beyond the monthly quota.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Transform Your Open Houses?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of agents who are closing more deals with AI-powered lead intelligence.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 px-10 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25"
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs">
                OH
              </div>
              <span className="font-semibold">OpenHouse Pro</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OpenHouse Pro. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
