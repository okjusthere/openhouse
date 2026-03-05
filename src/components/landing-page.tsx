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

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState("hot");

  const selectedPreview = useMemo(
    () => SCRIPT_PREVIEWS.find((item) => item.key === activePreview) ?? SCRIPT_PREVIEWS[0],
    [activePreview]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-22rem] h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[120px]" />
        <div className="absolute right-[-10rem] top-[20rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute left-[-8rem] top-[38rem] h-[24rem] w-[24rem] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-semibold text-white">
              OH
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-wide">OpenHouse</p>
              <p className="text-[11px] text-muted-foreground">Agent growth platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16 md:pt-[4.25rem]">
        <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-16 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <Badge className="mb-5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
              For North American real estate teams
            </Badge>
            <h1
              className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
            >
              Turn every open house into a{" "}
              <span className="bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                measured lead pipeline
              </span>
              .
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              OpenHouse is an AI-native event workflow for modern brokerages: branded sign-in,
              automatic lead scoring, enrichment, and seller-ready reporting in one operational
              surface.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  Launch your first event
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#product">
                <Button size="lg" variant="outline" className="h-12 px-6">
                  Explore product
                </Button>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-emerald-700">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              AI outputs are draft-first. Human review stays in your workflow.
            </p>
          </div>

          <aside className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-2xl shadow-emerald-900/5 backdrop-blur-xl md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
                Daily ops snapshot
              </p>
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                Live Workflow
              </Badge>
            </div>

            <div className="mt-4 space-y-3 rounded-2xl border border-border/50 bg-background/60 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Saturday Open House</span>
                <span className="font-medium">123 Park Avenue, NY</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                  <p className="text-lg font-semibold">27</p>
                  <p className="text-[11px] text-muted-foreground">sign-ins</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                  <p className="text-lg font-semibold text-orange-600">6</p>
                  <p className="text-[11px] text-muted-foreground">hot leads</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                  <p className="text-lg font-semibold text-cyan-700">14</p>
                  <p className="text-[11px] text-muted-foreground">follow-ups</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
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
                  className="flex items-start justify-between rounded-2xl border border-border/50 bg-background/55 px-4 py-3"
                >
                  <div className="inline-flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-emerald-500/10 p-1.5 text-emerald-700">
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

        <section
          id="product"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
              Product
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
            >
              Purpose-built for brokerage-grade open house operations.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Not another generic form builder. Each module maps to how North American agents
              actually run events, qualify visitors, and report outcomes.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PRODUCT_PILLARS.map((pillar) => (
              <article
                key={pillar.title}
                className="group rounded-3xl border border-border/60 bg-card/50 p-5 transition-all hover:border-emerald-500/30 hover:bg-card/70 md:p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground">
                    {pillar.id}
                  </span>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-700 transition-colors group-hover:bg-emerald-500/20">
                    <pillar.icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
                Workflow
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
              >
                Open. Scan. Score. Follow up.
              </h2>
              <p className="mt-4 text-muted-foreground">
                A single operating loop, from event launch to post-event outreach.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {WORKFLOW_STEPS.map((item) => (
                <article
                  key={item.step}
                  className="rounded-3xl border border-border/60 bg-card/55 p-5 md:p-6"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {item.step}
                  </p>
                  <div className="mt-3 inline-flex rounded-xl bg-emerald-500/10 p-2 text-emerald-700">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
              AI playbooks
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
            >
              Different lead tiers, different operating moves.
            </h2>
            <p className="mt-4 text-muted-foreground">
              OpenHouse does not flatten every visitor into one sequence. It aligns recommendations
              to urgency and likelihood.
            </p>

            <div className="mt-6 space-y-2">
              {SCRIPT_PREVIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActivePreview(item.key)}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${activePreview === item.key
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-border/60 bg-card/40 hover:border-emerald-500/25"
                    }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                </button>
              ))}
            </div>
          </div>

          <article className="rounded-3xl border border-border/60 bg-card/55 p-6 md:p-7">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Inside the recommendation engine
              </p>
              <Clock3 className="h-4 w-4 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">{selectedPreview.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{selectedPreview.body}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPreview.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Why teams keep this
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  "Prioritization is standardized across every event.",
                  "Outreach copy is generated in the same workflow context.",
                  "Seller reporting remains aligned with lead actions.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section id="audience" className="scroll-mt-24 border-y border-border/60 bg-muted/20">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
                Who it&apos;s for
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
              >
                Built for teams that treat open houses as pipeline operations.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {AUDIENCE.map((profile) => (
                <article
                  key={profile.role}
                  className="rounded-3xl border border-border/60 bg-card/55 p-5 md:p-6"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                    {profile.role}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{profile.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{profile.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl border border-border/60 bg-card/55 p-5 md:p-6">
                <p className="text-sm font-semibold">Operational guardrail</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  OpenHouse is a lead operations platform. It is not legal, tax, MLS, fair housing,
                  or RESPA compliance advice.
                </p>
              </article>
              <article className="rounded-3xl border border-border/60 bg-card/55 p-5 md:p-6">
                <p className="text-sm font-semibold">Publishing expectation</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI-generated recommendations and follow-up drafts should be reviewed by your team
                  before outbound use.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
              Pricing
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
            >
              Two plans, clear operating boundaries.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {PRICING.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-3xl border p-6 md:p-7 ${plan.highlighted
                    ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-card/90 shadow-xl shadow-emerald-900/5"
                    : "border-border/60 bg-card/55"
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {plan.name}
                    </p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                      {plan.price}
                      <span className="ml-1 text-base text-muted-foreground">{plan.period}</span>
                    </p>
                  </div>
                  {plan.highlighted && (
                    <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-700">
                      Recommended
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{plan.summary}</p>

                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="mt-6 block">
                  <Button
                    className={`w-full ${plan.highlighted
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
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

          <p className="mt-5 text-xs text-muted-foreground">
            Pro includes 100 PDL enrichments monthly. Additional enrichment usage is billed at $0.30
            per lookup.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
          <div className="rounded-3xl border border-border/60 bg-card/55 p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700/90">
                  FAQ
                </p>
                <h2
                  className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
                  style={{ fontFamily: '"Canela", "Fraunces", "Times New Roman", serif' }}
                >
                  Questions teams ask before rollout.
                </h2>
              </div>

              <div className="space-y-4">
                {FAQ.map((item) => (
                  <article
                    key={item.q}
                    className="rounded-2xl border border-border/60 bg-background/65 p-4"
                  >
                    <h3 className="text-sm font-semibold">{item.q}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
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
