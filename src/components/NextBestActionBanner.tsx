"use client";

import Link from "next/link";
import React from "react";

export interface NextBestActionBannerProps {
  resumeCount: number;
  analysisCount: number;
  generalAtsScore: number | null;
  applicationCount?: number;
}

interface ActionConfig {
  text: string;
  href: string;
  ctaText: string;
  borderAccent: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  tagText: string;
  tagStyle: string;
}

export default function NextBestActionBanner({
  resumeCount,
  analysisCount,
  generalAtsScore,
  applicationCount = 0,
}: NextBestActionBannerProps) {
  // Determine action config based on priority logic
  let config: ActionConfig;

  if (resumeCount === 0) {
    config = {
      text: "Upload your first resume to get started",
      href: "/dashboard/resumes",
      ctaText: "Upload Resume",
      borderAccent: "border-l-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      tagText: "Action Needed",
      tagStyle: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
      ),
    };
  } else if (analysisCount === 0) {
    config = {
      text: "Run your first ATS scan to see your score",
      href: "/dashboard/studio",
      ctaText: "Run ATS Scan",
      borderAccent: "border-l-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      tagText: "Action Needed",
      tagStyle: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    };
  } else if (generalAtsScore !== null && generalAtsScore < 60) {
    config = {
      text: "Your baseline score is low — open 1-Click Fix Wizard to boost it",
      href: "/dashboard/studio",
      ctaText: "Open Fix Wizard",
      borderAccent: "border-l-rose-500",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
      tagText: "Critical",
      tagStyle: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    };
  } else if (
    generalAtsScore !== null &&
    generalAtsScore >= 75 &&
    (!applicationCount || applicationCount === 0)
  ) {
    config = {
      text: "You're ready to apply! Save jobs to your Kanban tracker",
      href: "/dashboard/tracker",
      ctaText: "Open Job Tracker",
      borderAccent: "border-l-emerald-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      tagText: "Ready to Apply",
      tagStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    };
  } else if (
    generalAtsScore !== null &&
    generalAtsScore >= 60 &&
    generalAtsScore < 75
  ) {
    config = {
      text: "Almost there! Tweak 2-3 keywords to reach 75%+ match",
      href: "/dashboard/studio",
      ctaText: "Tweak Keywords",
      borderAccent: "border-l-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      tagText: "Optimization",
      tagStyle: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    };
  } else {
    config = {
      text: "Keep optimizing! Run a new scan against your next target job",
      href: "/dashboard/studio",
      ctaText: "Run New Scan",
      borderAccent: "border-l-amber-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      tagText: "Recommended",
      tagStyle: "bg-amber-500/10 text-amber-300 border-amber-500/30",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      ),
    };
  }

  return (
    <div
      className={`w-full bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-4 sm:p-5 shadow-2xl border-l-4 ${config.borderAccent} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white`}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          className={`p-2.5 rounded-xl border border-white/10 ${config.iconBg} ${config.iconColor} shrink-0 flex items-center justify-center`}
        >
          {config.icon}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.tagStyle}`}
            >
              {config.tagText}
            </span>
          </div>
          <p className="text-sm font-sans font-medium text-slate-100 leading-snug truncate sm:whitespace-normal">
            {config.text}
          </p>
        </div>
      </div>

      <Link
        href={config.href}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm font-sans transition-all duration-200 shrink-0 inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 active:scale-[0.98]"
      >
        <span>{config.ctaText}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );
}
