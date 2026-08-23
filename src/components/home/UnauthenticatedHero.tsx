"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";
import { LiveHeroDemoWidget } from "./LiveHeroDemoWidget";

export default function UnauthenticatedHero() {
  const PIPELINE_STAGES = [
    {
      id: "foundation",
      icon: "🏗️",
      tag: "STAGE 1: FOUNDATION",
      title: "Identity & Arsenal",
      description:
        "Build a pixel-perfect ATS resume and a high-ranking LinkedIn profile. Our STAR metric diff engine rewrites your passive verbs into high-impact numbers.",
      badge: "Resume Studio",
      href: "/login",
    },
    {
      id: "hunt",
      icon: "🤖",
      tag: "STAGE 2: THE HUNT",
      title: "Autonomous Swarm",
      description:
        "Deploy background AI agents that discover opportunities, tailor custom application packets, and sync matches directly to your Kanban pipeline.",
      badge: "Job Matcher",
      href: "/login",
    },
    {
      id: "loop",
      icon: "🎙️",
      tag: "STAGE 3: ACTIVE LOOP",
      title: "Interview Mastery",
      description:
        "Practice out loud with 8 AI interviewer personas, analyze your video composure, and get company-specific questions loaded before the interview.",
      badge: "Voice & Video Mocks",
      href: "/login",
    },
    {
      id: "close",
      icon: "💰",
      tag: "STAGE 4: THE CLOSE",
      title: "Salary War Room",
      description:
        "Model 4-year total compensation packages and roleplay negotiation tactics with our AI recruiter bot to secure top-tier market equity.",
      badge: "Compensation Lab",
      href: "/login",
    },
  ];

  return (
    <div className="flex flex-col bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#09090B] overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* A. HERO SECTION                                                        */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-18 md:pb-24 border-b border-[#27272A] flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between pb-8 sm:pb-12">
          <Link href="/" className="select-none active:scale-95 transition-transform">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Get Started &rarr;
            </Link>
          </div>
        </div>

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-64 sm:h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#18181B] border border-[#27272A] rounded-full text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#FAFAFA] animate-pulse" />
            <span>TALENTMUX • THE 4-STAGE CAREER CAMPAIGN</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAFAFA] leading-[1.08] max-w-4xl mx-auto">
            The 4-Stage Autonomous Career Pipeline.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed font-normal">
            Stop juggling 14 disconnected tools. <strong>TalentMux</strong> holds your hand through a linear questline: from building your foundational resume, deploying autonomous background hunters, mastering live mocks, to negotiating top-tier compensation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="/login"
              className="touch-target w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#FAFAFA] flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>👤 Start Your Campaign Free</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="pt-6 w-full">
            <LiveHeroDemoWidget />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* B. THE 4-STAGE PIPELINE TILES                                          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#27272A] bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider text-zinc-300 rounded-full">
              YOUR CAREER QUESTLINE
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FAFAFA] tracking-tight">
              An Event-Driven Funnel, Not a Patchwork of Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
              Every engine inside TalentMux dynamically unlocks at the exact moment you need it. You don't need a toolbox; you need a guided campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {PIPELINE_STAGES.map((tile) => (
              <Link
                key={tile.id}
                href={tile.href}
                className="bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all group hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {tile.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase font-mono text-zinc-300">
                      {tile.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                      {tile.tag}
                    </span>
                    <h3 className="text-lg font-bold text-[#FAFAFA] group-hover:text-white transition-colors">
                      {tile.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* C. SOCIAL PROOF & METRIC TELEMETRY                                     */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <StatsAndReviewsSection />

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* D. FINAL CALL TO ACTION                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 text-center bg-[#18181B] border-t border-[#27272A] text-[#FAFAFA]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FAFAFA] tracking-tight">
            Ready to Start Your Campaign?
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
            Join thousands of ambitious professionals using TalentMux to master their job hunt pipeline.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="touch-target w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#FAFAFA] active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Start For Free</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
