"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

interface VerifiedPortfolioCardProps {
  username: string;
  fullName?: string;
  targetRole?: string;
  atsScore?: number;
  challengesCompleted?: number;
  systemDesignGrade?: string;
  mockInterviewScore?: number;
  skills?: string[];
}

export function VerifiedPortfolioCard({
  username,
  fullName = "Alex Rivers",
  targetRole = "Staff Software Engineer",
  atsScore = 94,
  challengesCompleted = 18,
  systemDesignGrade = "A+",
  mockInterviewScore = 91,
  skills = ["Distributed Systems", "PostgreSQL Sharding", "Kafka", "TypeScript", "Go", "Docker", "Kubernetes"],
}: VerifiedPortfolioCardProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans p-4 sm:p-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Top Header & Verified Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
                KYRO VERIFIED CANDIDATE PORTFOLIO
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
                {fullName}
              </h1>
              <p className="text-xs text-zinc-600">
                @{username} • <strong className="text-black">{targetRole}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-4 py-2 bg-black text-white text-xs font-black rounded-2xl border border-black shadow-sm flex items-center gap-1.5">
              <span>✓</span>
              <span>100% KYRO Certified</span>
            </span>
          </div>
        </div>

        {/* 4 Verified Competency Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              ATS Resume Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-black font-mono">
              {atsScore}%
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">
              Top 5% Format Compliance
            </span>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Coding Sandbox
            </span>
            <div className="text-2xl sm:text-3xl font-black text-black font-mono">
              {challengesCompleted} Solved
            </div>
            <span className="text-[10px] text-zinc-600 font-bold block">
              O(N) Complexity Verified
            </span>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              System Design Grade
            </span>
            <div className="text-2xl sm:text-3xl font-black text-black font-mono">
              {systemDesignGrade}
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block">
              Zero SPOF Architecture
            </span>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Mock Interview Score
            </span>
            <div className="text-2xl sm:text-3xl font-black text-black font-mono">
              {mockInterviewScore}%
            </div>
            <span className="text-[10px] text-zinc-600 font-bold block">
              Executive Presence Verified
            </span>
          </div>
        </div>

        {/* Core Competencies */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Verified Engineering Skills & Taxonomy
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-black shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Recruiter Quick Action */}
        <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-black">Interested in interviewing {fullName}?</h4>
            <p className="text-xs text-zinc-600">
              Verified through KYRO's in-browser coding tests and architectural assessments.
            </p>
          </div>
          <Link
            href="/dashboard/recruiter"
            className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black transition-all shadow-md active:scale-95"
          >
            <span>Request Recruiter Contact &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pt-8 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} KYRO AI. The Universal Career & Talent Operating System.
      </footer>
    </div>
  );
}
