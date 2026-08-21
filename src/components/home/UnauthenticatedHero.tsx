"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";
import { LiveHeroDemoWidget } from "./LiveHeroDemoWidget";

export default function UnauthenticatedHero() {
  // Core Feature Deep-Dive Tiles (The OS Feel)
  const OS_TILES = [
    {
      id: "semantic-discovery",
      icon: "🔍",
      tag: "PGVECTOR MATCH",
      title: "Semantic Job & Skill Discovery",
      description:
        "Rank 140k+ live job openings across every discipline using 384-dimensional pgvector cosine embeddings matched directly against your verified career profile.",
      badge: "Universal Search",
      href: "/dashboard/jobs",
    },
    {
      id: "star-diff-engine",
      icon: "✨",
      tag: "DIFF ENGINE",
      title: "STAR Metric Diff Rewriter",
      description:
        "Transform weak passive verbs into high-impact quantified achievements with live red/green inline character diffs for any role or seniority level.",
      badge: "Inline Diffs",
      href: "/dashboard/builder",
    },
    {
      id: "autonomous-swarm",
      icon: "🤖",
      tag: "BACKGROUND SWARM",
      title: "Autonomous Hunter Swarm",
      description:
        "Deploy 24/7 background AI agents that discover opportunities across all job boards, tailor custom application packets, and sync with your pipeline.",
      badge: "4 Active Agents",
      href: "/dashboard/agents",
    },
    {
      id: "voice-telemetry",
      icon: "🎙️",
      tag: "WEB SPEECH AI",
      title: "Spoken Voice Mock Coach",
      description:
        "Practice out loud for behavioral, leadership, and domain interviews across 8 AI interviewer personas with live 48-bar audio waveform rendering.",
      badge: "8 Personas",
      href: "/dashboard/mock-interview",
    },
    {
      id: "video-hud",
      icon: "👁️",
      tag: "COMPUTER VISION",
      title: "Video Composure & Presence HUD",
      description:
        "Webcam telemetry measuring eye contact, vocal cadence, and posture composure to ensure executive presence in high-stakes interviews.",
      badge: "Vision HUD",
      href: "/dashboard/video-analytics",
    },
    {
      id: "equity-vesting",
      icon: "💰",
      tag: "COMPENSATION LAB",
      title: "Salary & Equity Offer Simulator",
      description:
        "Model 4-year total compensation packages across base, bonus, and stock options, backed by an interactive AI recruiter salary negotiation simulator.",
      badge: "Compensation Lab",
      href: "/dashboard/offers",
    },
  ];

  return (
    <div className="flex flex-col bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#09090B] overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* A. HERO SECTION (With Top-Left Logo & No Topbar)                         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-18 md:pb-24 border-b border-[#27272A] flex flex-col items-center justify-center text-center">
        {/* Top-Left Logo Wordmark (Pure Minimal Placement — No Topbar) */}
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

        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-64 sm:h-96 bg-zinc-800/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#18181B] border border-[#27272A] rounded-full text-[11px] font-bold uppercase tracking-wider text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-[#FAFAFA] animate-pulse" />
            <span>PANIUND • THE UNIVERSAL TALENT OPERATING SYSTEM</span>
          </div>

          {/* Main Headline with Brand Name */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAFAFA] leading-[1.08] max-w-4xl mx-auto">
            The Complete AI Career &amp; Talent Operating System for Every Role.
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed font-normal">
            <strong>paniund</strong> elevates your entire career journey — whether you are in Engineering, Marketing, Operations, Product, Finance, or Executive Management. Build ATS-verified resumes, practice live interviews, simulate compensation offers, and empower recruiters to hire world-class talent without friction.
          </p>

          {/* Dual High-Contrast CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 w-full max-w-md sm:max-w-none mx-auto">
            {/* Button 1: Candidate (Primary Style) */}
            <Link
              href="/login"
              className="touch-target w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#FAFAFA] flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>👤 Enter as Candidate</span>
              <span>&rarr;</span>
            </Link>

            {/* Button 2: Recruiter (Secondary / Outlined Style) */}
            <Link
              href="/dashboard/recruiter"
              className="touch-target w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#18181B] hover:bg-[#222226] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#27272A] hover:border-[#FAFAFA] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>👔 Enter as Recruiter</span>
            </Link>
          </div>

          {/* Interactive Live Multi-Role Demo Widget */}
          <div className="pt-6 w-full">
            <LiveHeroDemoWidget />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* B. THE DUAL ECOSYSTEM (Bifurcated Layout)                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#27272A] bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider text-zinc-300 rounded-full">
              DUAL-SIDED TALENT OS
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FAFAFA] tracking-tight">
              Engineered for Both Sides of the Hiring Table
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
              Whether you are an ambitious professional targeting your next high-impact career move or a hiring team evaluating applicants, paniund provides dedicated, high-performance environments.
            </p>
          </div>

          {/* 2-Column Bifurcated Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* COLUMN 1: Candidate Suite */}
            <div className="bg-[#18181B] border-2 border-[#27272A] hover:border-[#FAFAFA] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all group">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#27272A] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      👤
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">FOR JOB SEEKERS &amp; PROFESSIONALS</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">Candidate Suite</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase rounded-lg text-emerald-400">
                    100% Free
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  A comprehensive operating system to build ATS-proof resumes for any role, practice live voice mocks, master technical and domain challenges, and negotiate top-tier compensation.
                </p>

                {/* Key Features Scannable List */}
                <div className="space-y-3">
                  {[
                    {
                      icon: "📄",
                      title: "ATS Resume Studio (6 Universal Templates)",
                      desc: "Pixel-perfect A4 print engine with drag-and-drop section ordering and STAR metric diff rewrites for all industries.",
                    },
                    {
                      icon: "📊",
                      title: "Target Job Description Keyword Scanner",
                      desc: "Real-time semantic keyword coverage and gap analysis against any target job posting.",
                    },
                    {
                      icon: "🎙️",
                      title: "Spoken Voice Mock Interviewer",
                      desc: "8 conversational AI interviewer personas with live audio waveforms, filler-word analysis, and instant debriefs.",
                    },
                    {
                      icon: "💻",
                      title: "Technical & Problem Solving Sandbox",
                      desc: "Interactive algorithmic challenge IDE with real-time test assertions and complexity reviews.",
                    },
                    {
                      icon: "💰",
                      title: "Salary & Equity Negotiation War Room",
                      desc: "4-year compensation models and live AI recruiter negotiation roleplay simulation bots.",
                    },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl flex items-start gap-3 hover:border-zinc-500 transition-colors"
                    >
                      <span className="text-lg shrink-0 pt-0.5">{feat.icon}</span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-[#FAFAFA]">{feat.title}</h4>
                        <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Launch Button */}
              <div className="pt-4 border-t border-[#27272A]">
                <Link
                  href="/login"
                  className="touch-target w-full min-h-[48px] py-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#FAFAFA] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Launch Candidate Suite Free &rarr;</span>
                </Link>
              </div>
            </div>

            {/* COLUMN 2: Recruiter Talent Operating System */}
            <div className="bg-[#18181B] border-2 border-[#27272A] hover:border-[#FAFAFA] rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all group">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#27272A] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      👔
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">FOR RECRUITERS &amp; HIRING TEAMS</span>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">Recruiter OS</h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase rounded-lg text-zinc-300 font-mono">
                    Pro Talent OS
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  End-to-end recruitment infrastructure to generate bias-free requisitions in 15 seconds, batch screen hundreds of applicant resumes, and manage collaborative pipelines.
                </p>

                {/* Key Features Scannable List */}
                <div className="space-y-3">
                  {[
                    {
                      icon: "📝",
                      title: "AI Job Description Architect",
                      desc: "Draft structured, bias-free job postings with role requirements, screening criteria, and interview rubrics in 15s.",
                    },
                    {
                      icon: "📋",
                      title: "8-Stage Visual Pipeline Kanban",
                      desc: "Track candidate applications across Screening, Interviews, Domain Evaluations, Bar Raiser, Offer, and Hired.",
                    },
                    {
                      icon: "⚡",
                      title: "Bulk ATS Resume Screener",
                      desc: "Upload dozens of candidate resumes simultaneously with instant compatibility scores and red-flag audits.",
                    },
                    {
                      icon: "📹",
                      title: "WebRTC Video Interview Rooms",
                      desc: "Host peer-to-peer interview rounds with synchronized evaluations, shared scorecards, and AI copilots.",
                    },
                    {
                      icon: "🎯",
                      title: "Objective Scorecards & Committee Debriefs",
                      desc: "Standardize grading across role competencies and domain depth with 1-click debrief synthesis.",
                    },
                  ].map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl flex items-start gap-3 hover:border-zinc-500 transition-colors"
                    >
                      <span className="text-lg shrink-0 pt-0.5">{feat.icon}</span>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-[#FAFAFA]">{feat.title}</h4>
                        <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Launch Button */}
              <div className="pt-4 border-t border-[#27272A]">
                <Link
                  href="/dashboard/recruiter"
                  className="touch-target w-full min-h-[48px] py-3 bg-[#18181B] hover:bg-[#222226] text-[#FAFAFA] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#27272A] hover:border-[#FAFAFA] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Launch Recruiter OS &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* C. FEATURE DEEP-DIVE TILES (The OS Feel)                                 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#27272A] bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider text-zinc-300 rounded-full">
              OS-GRADE ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FAFAFA] tracking-tight">
              An Integrated Operating System, Not a Patchwork of Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
              Every engine inside paniund shares a unified state and vector model, giving you seamless transitions across your entire career journey.
            </p>
          </div>

          {/* Deep-Dive Tile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {OS_TILES.map((tile) => (
              <Link
                key={tile.id}
                href={tile.href}
                className="bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all group hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Tile Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {tile.icon}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase font-mono text-zinc-300">
                      {tile.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
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

                {/* Bottom Tile Action */}
                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-bold text-[#FAFAFA] group-hover:underline">
                  <span>Explore Engine</span>
                  <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* D. ARCHITECTURAL SUPERIORITY MATRIX                                      */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B] border-b border-[#27272A]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1.5 bg-[#18181B] text-[#FAFAFA] border border-[#27272A] text-xs font-bold uppercase rounded-full tracking-wider">
              ⚡ ARCHITECTURAL SUPERIORITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#FAFAFA] tracking-tight">
              Why paniund Outperforms Fragmented Single-Purpose Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-lg mx-auto">
              Replace 6 disconnected subscriptions with one cohesive, distraction-free talent operating system.
            </p>
          </div>

          <div className="border border-[#27272A] rounded-3xl overflow-hidden bg-[#18181B]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#09090B] border-b border-[#27272A] text-[#FAFAFA]">
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider">Capability</th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-[#FAFAFA] bg-[#18181B]">
                    paniund System
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-zinc-500">
                    Legacy Job Sites / Single Tools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] font-medium text-zinc-300">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#FAFAFA]">Universal ATS Resume Studio</td>
                  <td className="p-4 sm:p-5 text-[#FAFAFA] font-bold bg-[#18181B]">
                    ✓ 6 Templates + Inline STAR Diff Rewriter + Multi-JD Keyword Scanner
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Basic static PDF builder without AI metric diffs</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#FAFAFA]">Interview Practice &amp; Spoken Mocks</td>
                  <td className="p-4 sm:p-5 text-[#FAFAFA] font-bold bg-[#18181B]">
                    ✓ Conversational Voice Mocks (8 Personas) + Video Composure HUD
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Text-only static question lists</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#FAFAFA]">Domain &amp; Technical Preparation</td>
                  <td className="p-4 sm:p-5 text-[#FAFAFA] font-bold bg-[#18181B]">
                    ✓ In-Browser Sandbox + Big-O Analysis + System Design Whiteboard
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Separate expensive subscriptions required</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#FAFAFA]">Offer &amp; Salary Negotiation</td>
                  <td className="p-4 sm:p-5 text-[#FAFAFA] font-bold bg-[#18181B]">
                    ✓ 4-Year Total Compensation Lab + AI Recruiter Roleplay Simulator
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Static self-reported averages without simulation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#FAFAFA]">Autonomous Search &amp; Tracking</td>
                  <td className="p-4 sm:p-5 text-[#FAFAFA] font-bold bg-[#18181B]">
                    ✓ Hunter Agent Swarm + 1-Click Application Tracker Sync
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Manual copy-pasting into spreadsheets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* E. SOCIAL PROOF & METRIC TELEMETRY                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <StatsAndReviewsSection />

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* F. FINAL CALL TO ACTION                                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 md:py-20 px-4 text-center bg-[#18181B] border-t border-[#27272A] text-[#FAFAFA]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#FAFAFA] tracking-tight">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
            Join thousands of ambitious professionals and top hiring teams using paniund to master interviews and secure market-leading compensation.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="touch-target w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-[#FAFAFA] active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Get Started Free — No Credit Card Needed</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
