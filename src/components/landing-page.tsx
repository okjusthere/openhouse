"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  Globe2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Zap,
} from "lucide-react";

/* ───────────────────── Data ───────────────────── */

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#workflow", label: "Workflow" },
  { href: "#audience", label: "Who it's for" },
  { href: "#pricing", label: "Pricing" },
];

const HERO_STATS = [
  { value: "3x", label: "faster lead qualification" },
  { value: "< 60s", label: "from sign-in to scored lead" },
  { value: "100", label: "PDL enrichments included in Pro" },
];

const PRODUCT_PILLARS = [
  {
    id: "01",
    title: "Capture that feels branded",
    description:
      "Mobile sign-in, kiosk mode, QR entry points, and custom fields that look like your brokerage, not a generic form.",
    icon: Building2,
  },
  {
    id: "02",
    title: "AI-native lead intelligence",
    description:
      "Rule + LLM scoring, tiering, recommendation text, and enrichment signals in a single profile built for next-action speed.",
    icon: Brain,
  },
  {
    id: "03",
    title: "Operational daily workflow",
    description:
      "From open-house setup to follow-up generation, every step is sequenced so agents can run events without tool switching.",
    icon: CalendarDays,
  },
  {
    id: "04",
    title: "Seller-ready reporting",
    description:
      "Shareable report views, traffic timeline, visitor mix, and export controls for client updates and internal performance review.",
    icon: BarChart3,
  },
];

const WORKFLOW_STEPS = [
  {
    step: "Step 1",
    title: "Launch the event",
    description:
      "Create the open house, set event details, and publish a branded QR sign-in link in minutes.",
    icon: CalendarDays,
  },
  {
    step: "Step 2",
    title: "Capture and score automatically",
    description:
      "Visitors sign in, leads are scored, and Pro plans run enrichment + recommendation logic with no manual trigger.",
    icon: Zap,
  },
  {
    step: "Step 3",
    title: "Act and report",
    description:
      "Prioritize hot leads, generate AI follow-up drafts, and deliver a seller-facing report after the event.",
    icon: FileCheck2,
  },
];

const SCRIPT_PREVIEWS = [
  {
    key: "hot",
    label: "Hot lead workflow",
    note: "For immediate callback windows",
    title: "Priority queue with urgency-first actions",
    body: "OpenHouse marks buyer readiness + urgency signals, then recommends a same-hour outreach path with talking points tailored to intent and profile confidence.",
    tags: ["Score 82", "Tier: HOT", "Follow-up: 1 hour"],
  },
  {
    key: "warm",
    label: "Warm lead workflow",
    note: "For 24-hour nurture cadence",
    title: "Structured next-day conversion flow",
    body: "Warm leads receive a suggested email draft with property context, timeline hints, and a low-friction CTA for scheduling the next conversation.",
    tags: ["Score 56", "Tier: WARM", "Follow-up: 24 hours"],
  },
  {
    key: "cold",
    label: "Cold lead workflow",
    note: "For long-cycle relationship building",
    title: "Low-pressure, list-building automation",
    body: "Lower-intent visitors are tagged for long-cycle nurture with AI-assisted copy focused on education, market trust, and opt-in engagement.",
    tags: ["Score 28", "Tier: COLD", "Follow-up: Drip"],
  },
];

const AUDIENCE = [
  {
    role: "Solo agent",
    title: "Needs consistency more than complexity",
    description:
      "For agents who need a dependable event-to-follow-up system without adding an operations headcount.",
  },
  {
    role: "Team lead",
    title: "Needs repeatable lead standards",
    description:
      "For teams that want every open house to follow the same capture, scoring, and reporting playbook.",
  },
  {
    role: "Brokerage ops",
    title: "Needs visibility and control",
    description:
      "For operators who need QA-friendly workflows, export controls, and performance transparency across events.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    summary: "Best for individual agents starting digital sign-in.",
    features: [
      "3 open houses / month",
      "50 sign-ins / month",
      "QR + kiosk sign-in",
      "Basic seller report",
      "CSV export",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    summary: "Built for AI-first lead qualification and follow-up.",
    features: [
      "Unlimited events and sign-ins",
      "AI lead scoring + recommendations",
      "100 PDL enrichments / month",
      "Property Q&A chatbot (500 queries / month)",
      "AI follow-up generation",
      "Detailed seller reporting",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
];

const FAQ = [
  {
    q: "Can I run this at an in-person open house without a separate app?",
    a: "Yes. Visitors can sign in through mobile web or kiosk mode using a QR link.",
  },
  {
    q: "Do I need Pro to score leads?",
    a: "Free captures sign-ins. Pro unlocks AI scoring, enrichment, recommendations, and follow-up generation.",
  },
  {
    q: "Does the platform replace legal or compliance review?",
    a: "No. OpenHouse accelerates drafts and prioritization. Agents should review outbound content before publishing.",
  },
];

/* ───────────────────── Component ───────────────────── */

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState("hot");

  const selectedPreview = useMemo(
    () => SCRIPT_PREVIEWS.find((item) => item.key === activePreview) ?? SCRIPT_PREVIEWS[0],
    [activePreview]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* ── Ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-emerald-300/12 blur-[140px]" />
        <div className="absolute right-[-8rem] top-[22rem] h-[26rem] w-[26rem] rounded-full bg-teal-300/10 blur-[120px]" />
        <div className="absolute left-[-6rem] top-[42rem] h-[22rem] w-[22rem] rounded-full bg-emerald-200/8 blur-[100px]" />
      </div>

      {/* ═══════════════════════════════════════════════
          Floating pill navbar
         ═══════════════════════════════════════════════ */}
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div className="floating-nav flex h-14 w-full max-w-4xl items-center justify-between rounded-full border border-border/50 px-2 shadow-lg shadow-black/[0.03]">
          <Link href="/" className="inline-flex items-center gap-2.5 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
              OH
            </div>
            <span className="text-sm font-semibold tracking-wide">OpenHouse</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 pr-1">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="rounded-full text-[13px] font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 text-[13px] font-medium text-white shadow-sm hover:from-emerald-600 hover:to-teal-700"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        {/* ═══════════════════════════════════════════════
            Hero
           ═══════════════════════════════════════════════ */}
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-12 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:pb-28 lg:pt-16">
          <div>
            <Badge className="mb-6 rounded-full border-emerald-500/25 bg-emerald-500/8 px-3.5 py-1 text-emerald-700">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              For North American real estate teams
            </Badge>
            <h1 className="font-display max-w-3xl text-[2.75rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Turn every open house into a{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                measured lead pipeline
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              OpenHouse is an AI-native event workflow for modern brokerages: branded sign-in,
              automatic lead scoring, enrichment, and seller-ready reporting in one operational
              surface.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-7 text-white shadow-md shadow-emerald-900/10 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg"
                >
                  Launch your first event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#product">
                <Button size="lg" variant="outline" className="h-12 rounded-full px-7">
                  Explore product
                </Button>
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/50 bg-card/70 px-4 py-3.5 backdrop-blur"
                >
                  <p className="font-display text-2xl font-semibold text-emerald-700">{stat.value}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-border/40 bg-card/50 px-3.5 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              AI outputs are draft-first. Human review stays in your workflow.
            </p>
          </div>

          {/* Hero preview card */}
          <aside className="rounded-[28px] border border-border/50 bg-card/80 p-5 shadow-2xl shadow-emerald-900/[0.04] backdrop-blur-xl md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
                Daily ops snapshot
              </p>
              <Badge className="rounded-full border-emerald-500/25 bg-emerald-500/8 text-emerald-700">
                Live Workflow
              </Badge>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saturday Open House</span>
                <span className="font-medium">123 Park Avenue, NY</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-muted/50 p-2.5 text-center">
                  <p className="font-display text-lg font-semibold">27</p>
                  <p className="text-[11px] text-muted-foreground">sign-ins</p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-2.5 text-center">
                  <p className="font-display text-lg font-semibold text-orange-600">6</p>
                  <p className="text-[11px] text-muted-foreground">hot leads</p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-2.5 text-center">
                  <p className="font-display text-lg font-semibold text-cyan-700">14</p>
                  <p className="text-[11px] text-muted-foreground">follow-ups</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {[
                {
                  title: "Kiosk capture completed",
                  meta: "11:26 AM",
                  icon: UserCheck,
                },
                {
                  title: "AI score + recommendation generated",
                  meta: "11:26 AM",
                  icon: Brain,
                },
                {
                  title: "PDL profile enriched",
                  meta: "11:27 AM",
                  icon: Globe2,
                },
                {
                  title: "Follow-up draft ready",
                  meta: "11:29 AM",
                  icon: MessageSquareText,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between rounded-2xl border border-border/40 bg-background/55 px-4 py-3"
                >
                  <div className="inline-flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-1.5 text-emerald-700">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.meta}</p>
                    </div>
                  </div>
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" />
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* ═══════════════════════════════════════════════
            Product pillars
           ═══════════════════════════════════════════════ */}
        <section
          id="product"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
                Product
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Morning brief, not a generic AI tool.
              </h2>
            </div>
            <p className="text-[15px] text-muted-foreground lg:text-right">
              Each module maps to how North American agents actually run events, qualify visitors,
              and report outcomes.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_PILLARS.map((pillar) => (
              <article
                key={pillar.title}
                className="group rounded-[24px] border border-border/50 bg-card/60 p-5 transition-all duration-200 hover:border-emerald-500/25 hover:bg-card/80 hover:shadow-lg hover:shadow-emerald-900/[0.03] md:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 font-display text-sm font-semibold text-emerald-700 transition-colors group-hover:bg-emerald-500/15">
                  {pillar.id}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold leading-snug">{pillar.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            Workflow
           ═══════════════════════════════════════════════ */}
        <section id="workflow" className="scroll-mt-24 border-y border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
                Workflow
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Open. Scan. Score. Follow up.
              </h2>
              <p className="mt-4 text-[15px] text-muted-foreground">
                A single operating loop, from event launch to post-event outreach.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {WORKFLOW_STEPS.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[24px] border border-border/50 bg-card/65 p-5 md:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {item.step}
                  </p>
                  <div className="mt-3 inline-flex rounded-xl bg-emerald-500/10 p-2 text-emerald-700">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            AI Playbooks
           ═══════════════════════════════════════════════ */}
        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
              AI playbooks
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Different lead tiers, different operating moves.
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground">
              OpenHouse does not flatten every visitor into one sequence. It aligns recommendations
              to urgency and likelihood.
            </p>

            <div className="mt-6 space-y-2">
              {SCRIPT_PREVIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePreview(item.key)}
                  className={`w-full rounded-2xl border p-3.5 text-left transition-all duration-200 ${activePreview === item.key
                      ? "border-emerald-500/35 bg-emerald-500/8 shadow-sm"
                      : "border-border/50 bg-card/50 hover:border-emerald-500/20 hover:bg-card/70"
                    }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                </button>
              ))}
            </div>
          </div>

          <article className="rounded-[24px] border border-border/50 bg-card/65 p-6 md:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Inside the recommendation engine
              </p>
              <Clock3 className="h-4 w-4 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{selectedPreview.title}</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{selectedPreview.body}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPreview.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="rounded-full border-emerald-500/25 bg-emerald-500/8 text-emerald-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border/40 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Why teams keep this
              </p>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Prioritization is standardized across every event.",
                  "Outreach copy is generated in the same workflow context.",
                  "Seller reporting remains aligned with lead actions.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        {/* ═══════════════════════════════════════════════
            Audience
           ═══════════════════════════════════════════════ */}
        <section id="audience" className="scroll-mt-24 border-y border-border/40 bg-muted/30">
          <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
                Who it&apos;s for
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for teams that treat open houses as pipeline operations.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {AUDIENCE.map((profile) => (
                <article
                  key={profile.role}
                  className="rounded-[24px] border border-border/50 bg-card/65 p-5 md:p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    {profile.role}
                  </p>
                  <h3 className="mt-3 text-[15px] font-semibold">{profile.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{profile.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-[24px] border border-border/50 bg-card/65 p-5 md:p-6">
                <p className="text-sm font-semibold">Operational guardrail</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  OpenHouse is a lead operations platform. It is not legal, tax, MLS, fair housing,
                  or RESPA compliance advice.
                </p>
              </article>
              <article className="rounded-[24px] border border-border/50 bg-card/65 p-5 md:p-6">
                <p className="text-sm font-semibold">Publishing expectation</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  AI-generated recommendations and follow-up drafts should be reviewed by your team
                  before outbound use.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            Pricing
           ═══════════════════════════════════════════════ */}
        <section
          id="pricing"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
              Pricing
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Two plans, clear operating boundaries.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {PRICING.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[28px] border p-6 md:p-7 ${plan.highlighted
                    ? "border-emerald-500/35 bg-gradient-to-b from-emerald-500/8 to-card/90 shadow-xl shadow-emerald-900/[0.04]"
                    : "border-border/50 bg-card/65"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {plan.name}
                    </p>
                    <p className="font-display mt-2 text-4xl font-semibold tracking-tight">
                      {plan.price}
                      <span className="ml-1 text-base font-normal text-muted-foreground">{plan.period}</span>
                    </p>
                  </div>
                  {plan.highlighted && (
                    <Badge className="rounded-full border-emerald-500/25 bg-emerald-500/10 text-emerald-700">
                      Recommended
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-[13px] text-muted-foreground">{plan.summary}</p>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="mt-6 block">
                  <Button
                    className={`w-full rounded-full ${plan.highlighted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/10 hover:from-emerald-600 hover:to-teal-700"
                        : ""
                      }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Pro includes 100 PDL enrichments monthly. Additional enrichment usage is billed at $0.30
            per lookup.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════
            FAQ
           ═══════════════════════════════════════════════ */}
        <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8">
          <div className="rounded-[28px] border border-border/50 bg-card/65 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700/90">
                  FAQ
                </p>
                <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Questions teams ask before rollout.
                </h2>
              </div>

              <div className="space-y-3">
                {FAQ.map((item) => (
                  <article
                    key={item.q}
                    className="rounded-2xl border border-border/40 bg-background/65 p-4"
                  >
                    <h3 className="text-sm font-semibold">{item.q}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════
          Footer
         ═══════════════════════════════════════════════ */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 OpenHouse · AI-native open house operations for North America</p>
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>Designed for real estate teams that execute daily.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
