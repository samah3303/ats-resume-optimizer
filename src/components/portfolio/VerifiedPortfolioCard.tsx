"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

interface VerifiedPortfolioProps {
  username: string;
  fullName?: string;
  targetRole?: string;
  generalAtsScore?: number;
  completedChallengesCount?: number;
  whiteboardDiagramCount?: number;
  mockInterviewScore?: number;
  skills?: string[];
}

export function VerifiedPortfolioCard({
  username,
  fullName = "Alex Rivers",
  targetRole = "Staff Distributed Systems Engineer",
  generalAtsScore = 94,
  completedChallengesCount = 12,
  whiteboardDiagramCount = 3,
  mockInterviewScore = 92,
  skills = ["TypeScript", "Next.js", "PostgreSQL", "System Design", "Rust", "Distributed Systems", "Docker", "Redis"],
}: VerifiedPortfolioProps) {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 space-y-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full bg-[#18181B] border border-[#27272A] rounded-3xl p-6 sm:p-10 space-y-8">
        {/* Top Header & Verified Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase text-zinc-300">
                PANIUND VERIFIED CANDIDATE PORTFOLIO
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight mt-1">
                {fullName}
              </h1>
              <p className="text-xs text-zinc-400">
                @{username} • <strong className="text-[#FAFAFA]">{targetRole}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-4 py-2 bg-[#FAFAFA] text-[#09090B] text-xs font-bold rounded-2xl border border-[#FAFAFA] flex items-center gap-1.5">
              <span>✓</span>
              <span>100% Paniund Certified</span>
            </span>
          </div>
        </div>

        {/* 4 Verified Competency Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-[#09090B] border border-[#27272A] rounded-3xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              ATS Resume Score
            </span>
            <div className="text-3xl font-bold font-mono text-emerald-400">
              {generalAtsScore}%
            </div>
            <span className="text-[10px] text-zinc-400 block">Verified Parser Pass</span>
          </div>

          <div className="p-5 bg-[#09090B] border border-[#27272A] rounded-3xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Coding Challenges
            </span>
            <div className="text-3xl font-bold font-mono text-[#FAFAFA]">
              {completedChallengesCount}
            </div>
            <span className="text-[10px] text-zinc-400 block">Monaco Unit Tests Passed</span>
          </div>

          <div className="p-5 bg-[#09090B] border border-[#27272A] rounded-3xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              System Designs
            </span>
            <div className="text-3xl font-bold font-mono text-[#FAFAFA]">
              {whiteboardDiagramCount}
            </div>
            <span className="text-[10px] text-zinc-400 block">SPOF &amp; QPS Verified</span>
          </div>

          <div className="p-5 bg-[#09090B] border border-[#27272A] rounded-3xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Spoken Voice Mock
            </span>
            <div className="text-3xl font-bold font-mono text-emerald-400">
              {mockInterviewScore}%
            </div>
            <span className="text-[10px] text-zinc-400 block">Executive Delivery Index</span>
          </div>
        </div>

        {/* Verified Technical Skills Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Verified Competencies &amp; Technical Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{skill}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Recruiter Quick Action */}
        <div className="p-6 bg-[#09090B] border border-[#27272A] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#FAFAFA]">Interested in interviewing {fullName}?</h4>
            <p className="text-xs text-zinc-400">
              Verified through paniund&apos;s in-browser coding tests and architectural assessments.
            </p>
          </div>
          <Link
            href="/dashboard/recruiter"
            className="touch-target px-6 py-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-2xl border border-[#FAFAFA] transition-all active:scale-95 text-center"
          >
            <span>Request Recruiter Contact &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-8 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} paniund. The Talent Operating System.
      </footer>
    </div>
  );
}
