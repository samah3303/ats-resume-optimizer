"use client";

import Link from "next/link";

interface PricingSectionProps {
  onStartFree?: () => void;
}

export default function PricingSection({ onStartFree }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-nordic-border">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-nordic-primary block mb-2">
            Pricing Plans
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
            Simple, transparent pricing
          </h2>
          <p className="text-sm sm:text-base text-nordic-text-secondary mt-2">
            Start for free to analyze your resume and organize applications. Upgrade to Pro when you need unlimited AI tailoring.
          </p>
        </div>

        {/* 2-Tier Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* TIER 1: FREE */}
          <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] shadow-xs flex flex-col justify-between hover:border-nordic-primary transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-nordic-bg border border-nordic-border text-xs font-bold uppercase tracking-wider text-nordic-text rounded-[2px]">
                  Free Tier
                </span>
                <span className="text-xs text-nordic-success font-bold">Forever Free</span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-nordic-text tracking-tight font-sans">
                    $0
                  </span>
                  <span className="text-xs text-nordic-neutral font-medium">/ month</span>
                </div>
                <p className="text-xs text-nordic-text-secondary mt-2 leading-relaxed">
                  Essential tools to evaluate your resume, uncover ATS gaps, and manage active applications.
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0F0F0] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-nordic-text block">
                  What&apos;s included:
                </span>
                <ul className="space-y-2.5 text-xs text-nordic-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-success font-bold shrink-0">✓</span>
                    <span><strong>Full resume audit</strong> & dimensional ATS scoring</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-success font-bold shrink-0">✓</span>
                    <span><strong>3 AI generations / day</strong> (cover letters, bullet rewrites, outreach)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-success font-bold shrink-0">✓</span>
                    <span><strong>Application tracker</strong> across 6 stages</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-success font-bold shrink-0">✓</span>
                    <span>Candidate profile with skills & target roles</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-success font-bold shrink-0">✓</span>
                    <span>Tone control (Professional, Conversational, Confident, Humble)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
              {onStartFree ? (
                <button
                  type="button"
                  onClick={onStartFree}
                  className="w-full nordic-btn-outline h-11 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active"
                >
                  Start Free — No Credit Card
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full nordic-btn-outline h-11 text-xs font-bold uppercase tracking-wide flex items-center justify-center tap-active"
                >
                  Start Free — No Credit Card
                </Link>
              )}
              <span className="block text-center text-[11px] text-nordic-neutral mt-2">
                Instant access upon resume upload
              </span>
            </div>
          </div>

          {/* TIER 2: PRO */}
          <div className="nordic-card p-6 sm:p-8 bg-white border-2 border-nordic-primary rounded-[4px] shadow-sm flex flex-col justify-between relative">
            {/* Most Popular Badge */}
            <div className="absolute -top-3.5 right-6 px-3 py-0.5 bg-nordic-secondary border border-nordic-text/20 text-nordic-text text-[10px] font-extrabold uppercase tracking-wider rounded-[2px] shadow-2xs">
              ★ Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-nordic-primary text-white text-xs font-bold uppercase tracking-wider rounded-[2px]">
                  Pro Tier
                </span>
                <span className="text-xs text-nordic-primary font-bold">For Active Job Seekers</span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-nordic-primary tracking-tight font-sans">
                    $9
                  </span>
                  <span className="text-xs text-nordic-neutral font-medium">/ month</span>
                </div>
                <p className="text-xs text-nordic-text-secondary mt-2 leading-relaxed">
                  High-speed workflow with unlimited tailoring and seamless browser extension synchronization.
                </p>
              </div>

              <div className="pt-4 border-t border-[#F0F0F0] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-nordic-text block">
                  Everything in Free, plus:
                </span>
                <ul className="space-y-2.5 text-xs text-nordic-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-primary font-bold shrink-0">★</span>
                    <span><strong>Unlimited AI generations</strong> (no daily generation limits)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-primary font-bold shrink-0">★</span>
                    <span><strong>Priority high-speed AI models</strong> for instant response</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-primary font-bold shrink-0">★</span>
                    <span><strong>Job URL auto-parsing</strong> (paste any link from any board)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-primary font-bold shrink-0">★</span>
                    <span><strong>1-Click Browser Extension sync</strong> (LinkedIn, Indeed, Bayt, Naukri)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-nordic-primary font-bold shrink-0">★</span>
                    <span><strong>Word document (.doc) export</strong> for edited cover letters</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F0F0F0]">
              <Link
                href="/login"
                className="w-full nordic-btn-yellow h-11 text-xs font-bold uppercase tracking-wide flex items-center justify-center text-nordic-text tap-active"
              >
                Upgrade to Pro
              </Link>
              <span className="block text-center text-[11px] text-nordic-neutral mt-2">
                Cancel anytime with 1 click · No commitments
              </span>
            </div>
          </div>
        </div>

        {/* Sustainability Note (Option A transparency principle) */}
        <div className="mt-12 max-w-2xl mx-auto p-4 bg-nordic-bg border border-nordic-border rounded-[4px] text-center">
          <p className="text-xs text-nordic-text-secondary leading-relaxed">
            <span className="font-bold text-nordic-primary">✨ Cost Sustainability Note:</span> paniund leverages efficient open-source and serverless AI models to keep infrastructure costs lean, enabling a generous, permanent free tier for candidates worldwide.
          </p>
        </div>
      </div>
    </section>
  );
}
