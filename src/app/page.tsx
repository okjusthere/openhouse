"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  QrCode,
  Brain,
  BarChart3,
  Smartphone,
  MessageSquareText,
  UserCheck,
  Zap,
  Shield,
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ─────────────────────────────  DATA  ───────────────────────────── */

const CAPABILITIES = [
  {
    icon: QrCode,
    title: "QR code sign-in",
    body: "Visitors scan a code from their phone. No app, no friction, no paper sheets to decipher later. Every sign-in is timestamped and structured.",
  },
  {
    icon: Brain,
    title: "AI lead scoring",
    body: "A four-dimension scoring engine evaluates buy-readiness, financial strength, engagement, and urgency — then GPT refines the assessment with enriched data.",
    pro: true,
  },
  {
    icon: UserCheck,
    title: "Contact enrichment",
    body: "People Data Lab fills in what visitors leave out: job title, company, income signals, LinkedIn, education. 100 lookups included monthly.",
    pro: true,
  },
  {
    icon: MessageSquareText,
    title: "Property Q&A chatbot",
    body: "An AI assistant grounded in MLS data and your custom FAQ answers visitor questions about the property, the neighborhood, and the process.",
    pro: true,
  },
  {
    icon: Zap,
    title: "Automated follow-ups",
    body: "AI generates a personalized follow-up email for every visitor, adapting tone and urgency to their lead tier. Review it, then send.",
    pro: true,
  },
  {
    icon: Smartphone,
    title: "iPad kiosk mode",
    body: "A full-screen loop designed for lobby display: welcome screen, sign-in form, thank-you — then it resets for the next visitor.",
  },
  {
    icon: BarChart3,
    title: "Seller reports",
    body: "Professional analytics to share with your sellers: traffic timeline, interest breakdown, visitor list with lead badges, and key insights.",
  },
  {
    icon: Shield,
    title: "CRM integration",
    body: "Push scored leads to Kevv CRM, Follow Up Boss, or any system via API. The SDK ships with typed methods for direct server integration.",
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Create the event",
    body: "Enter the address, set the window, add MLS details. Customize branding, compliance text, and any extra questions you need answered.",
  },
  {
    step: "02",
    title: "Share the link",
    body: "Generate a QR code, print the one-page flyer, or drop an iPad in kiosk mode at the front door. Visitors sign in from their own device.",
  },
  {
    step: "03",
    title: "Review and follow up",
    body: "AI scores every visitor, enriches their profile, and drafts a follow-up email. You review, adjust, and send — or export everything as CSV.",
  },
];

const FAQ = [
  {
    q: "What does the free plan include?",
    a: "Three events per month, 50 sign-ins, QR code and kiosk mode, basic seller reports, and CSV export. No credit card required.",
  },
  {
    q: "How does AI lead scoring work?",
    a: "A rule-based engine evaluates four dimensions — buy-readiness, financial strength, engagement, and urgency — for an instant 0–100 score. On Pro, GPT refines the score using enriched contact data from People Data Lab.",
  },
  {
    q: "What is People Data Lab enrichment?",
    a: "PDL cross-references a visitor's email or phone against a database of professional and demographic signals: job title, company, estimated income, education, social profiles. Pro includes 100 lookups per month; additional lookups cost $0.30 each.",
  },
  {
    q: "Can I use this with my existing CRM?",
    a: "Yes. Export data via CSV, connect through the REST API, or use the TypeScript SDK to integrate directly with Kevv CRM or other systems.",
  },
  {
    q: "Should I publish AI-generated follow-ups without editing?",
    a: "No. The follow-up generator is a draft engine. Every message should be reviewed for accuracy, tone, and compliance before sending.",
  },
];

/* ─────────────────────────────  PAGE  ───────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7]">
      {/* ── Nav ── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#0a0a0b] text-sm font-bold tracking-tight">
              O
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              OpenHouse
              <span className="text-[#a1a1aa]"> · open house desk</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-[#a1a1aa]">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[13px] text-[#a1a1aa] hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-[13px] bg-white text-[#0a0a0b] hover:bg-white/90 border-0 rounded-md h-8 px-4 font-medium">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white">
              Your open house desk.{" "}
              <span className="text-[#a1a1aa]">
                Not another paper sign-in sheet.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#a1a1aa]">
              OpenHouse turns visitor sign-ins into scored, enriched, follow-up-ready leads.
              Set up the event, share a QR code, and let AI handle scoring, enrichment, and
              draft follow-ups — so you spend the open house talking to buyers, not transcribing
              handwriting.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link href="/register">
                <Button className="h-11 px-7 text-[14px] bg-white text-[#0a0a0b] hover:bg-white/90 border-0 rounded-md font-medium">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#product">
                <Button variant="ghost" className="h-11 px-5 text-[14px] text-[#a1a1aa] hover:text-white">
                  See the product
                </Button>
              </a>
            </div>
            <p className="mt-5 text-[13px] text-[#52525b]">
              Free plan available · No credit card required · Works on any device
            </p>
          </div>
        </div>
      </section>

      {/* ── Quiet divider ── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-t border-white/[0.06]" />
      </div>

      {/* ── Product: Capabilities ── */}
      <section id="product" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Capture, score, enrich, follow up.
            </h2>
            <p className="mt-3 text-[#a1a1aa] text-[15px] leading-relaxed">
              OpenHouse packages the sign-in, scoring, enrichment, and follow-up workflow
              that usually eats the first two hours after a showing.
            </p>
          </div>

          <div className="grid gap-px bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden md:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="bg-[#0a0a0b] p-7 group hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#a1a1aa] group-hover:text-white transition-colors">
                    <c.icon className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
                      {c.title}
                      {c.pro && (
                        <span className="inline-flex items-center rounded-[4px] border border-white/[0.1] bg-white/[0.04] px-1.5 py-px text-[10px] font-medium uppercase tracking-wider text-[#a1a1aa]">
                          Pro
                        </span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#71717a]">
                      {c.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section id="workflow" className="py-20 md:py-28 border-y border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create, share, follow up.
            </h2>
            <p className="mt-3 text-[#a1a1aa] text-[15px] leading-relaxed">
              OpenHouse is intentionally simple in the handoff: create the event, share the
              sign-in link, and review AI-scored results with one-click follow-ups.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {WORKFLOW.map((w) => (
              <div key={w.step} className="group">
                <div className="text-[13px] font-medium text-[#52525b] tracking-wider mb-3">
                  {w.step}
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2">
                  {w.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#71717a]">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audience ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Built for three workflows.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                role: "Solo agents",
                need: "Needs lead capture without the tech overhead.",
                body: "For agents who run 2–5 open houses a month and want QR-code sign-in, instant lead scoring, and AI follow-ups without managing another SaaS tool.",
              },
              {
                role: "Teams",
                need: "Needs a shared pipeline from every showing.",
                body: "For teams whose open house leads used to land in individual spreadsheets. One dashboard, one scoring engine, push to your CRM.",
              },
              {
                role: "Brokerage ops",
                need: "Needs reporting and compliance at scale.",
                body: "For managing brokers who want visibility into Open House activity across agents: seller reports, lead volumes, and an audit trail from sign-in to follow-up.",
              },
            ].map((a) => (
              <Card key={a.role} className="bg-white/[0.02] border-white/[0.06] rounded-xl">
                <CardContent className="p-7">
                  <h3 className="text-[15px] font-semibold text-white">{a.role}</h3>
                  <p className="mt-1 text-[13px] text-[#a1a1aa] italic">{a.need}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#71717a]">{a.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 md:py-28 border-y border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              One product. Two tiers.
            </h2>
            <p className="mt-3 text-[#a1a1aa] text-[15px] leading-relaxed">
              Start with the free plan. Upgrade when you want AI scoring, enrichment, and
              automated follow-ups.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
            {/* Free */}
            <Card className="bg-white/[0.02] border-white/[0.06] rounded-xl">
              <CardContent className="p-7">
                <h3 className="text-[15px] font-semibold text-white">Free</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-[13px] text-[#71717a]">forever</span>
                </div>
                <p className="mt-2 text-[13px] text-[#71717a]">
                  Core sign-in and reporting tools, no credit card.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "3 events / month",
                    "50 sign-ins / month",
                    "QR code + kiosk mode",
                    "Basic seller report",
                    "CSV export",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#a1a1aa]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#52525b]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block mt-7">
                  <Button variant="outline" className="w-full h-10 text-[13px] rounded-md border-white/[0.1] text-[#a1a1aa] hover:text-white hover:border-white/[0.2]">
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-white/[0.02] border-white/[0.15] rounded-xl relative">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <CardContent className="p-7">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-white">Pro</h3>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#a1a1aa] border border-white/[0.1] rounded px-2 py-0.5">
                    Popular
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$29</span>
                  <span className="text-[13px] text-[#71717a]">/month</span>
                </div>
                <p className="mt-2 text-[13px] text-[#71717a]">
                  Everything in Free, plus AI scoring, enrichment, and follow-ups.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Unlimited events",
                    "Unlimited sign-ins",
                    "AI lead scoring (rule + GPT)",
                    "100 PDL enrichments / mo",
                    "AI property Q&A (500 / mo)",
                    "AI follow-up drafts",
                    "Enhanced seller reports",
                    "CRM integration + API",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#a1a1aa]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/60" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block mt-7">
                  <Button className="w-full h-10 text-[13px] rounded-md bg-white text-[#0a0a0b] hover:bg-white/90 border-0 font-medium">
                    Start Pro trial
                  </Button>
                </Link>
                <p className="mt-3 text-[11px] text-[#52525b] text-center">
                  PDL overage: $0.30 per additional lookup
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl mb-14">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Common questions.
            </h2>
          </div>
          <div className="max-w-2xl space-y-0 divide-y divide-white/[0.06]">
            {FAQ.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Compliance ── */}
      <section className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-[12px] leading-relaxed text-[#52525b] max-w-2xl">
            OpenHouse is a lead-capture and scoring tool for residential real estate agents.
            It is not legal, tax, fair housing, or MLS compliance advice. Agents should review
            AI-generated content — including follow-up drafts and chatbot responses — before
            publication or distribution, especially where local regulations, brokerage policy,
            or fair housing sensitivity apply.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-[#0a0a0b] text-[11px] font-bold">
                O
              </span>
              <span className="text-[13px] font-semibold text-white">OpenHouse</span>
            </Link>
            <div className="flex gap-6 text-[12px] text-[#52525b]">
              <a href="#" className="hover:text-[#a1a1aa] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#a1a1aa] transition-colors">Terms</a>
              <a href="https://rescript.kevv.ai" className="hover:text-[#a1a1aa] transition-colors" target="_blank" rel="noopener noreferrer">
                A Kevv product
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────  FAQ ACCORDION  ───────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left group"
      >
        <span className="text-[14px] font-medium text-white group-hover:text-white/80 transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#52525b] transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      {open && (
        <p className="mt-3 text-[13px] leading-relaxed text-[#71717a] pr-8">
          {a}
        </p>
      )}
    </div>
  );
}
