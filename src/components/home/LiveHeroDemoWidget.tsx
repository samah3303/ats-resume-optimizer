"use client";

import { useState } from "react";
import Link from "next/link";

export function LiveHeroDemoWidget() {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const DEMOS = [
    {
      category: "Software & Tech",
      role: "Software Engineer",
      original: "Worked on database queries and made them faster for users.",
      enhanced:
        "Refactored PostgreSQL indexing and query execution plans, slashing p99 latency by 42% across 2.4M daily requests.",
      metrics: ["42% Latency Drop", "2.4M Daily Requests", "PostgreSQL"],
    },
    {
      category: "Marketing & Growth",
      role: "Growth Marketer",
      original: "Managed social ad campaigns and helped increase monthly leads.",
      enhanced:
        "Orchestrated multi-channel paid acquisition strategy across Meta & LinkedIn, driving 14,200 MQLs while cutting CPA by 31.4%.",
      metrics: ["14,200 Qualified Leads", "-31.4% Acquisition Cost", "Meta & LinkedIn"],
    },
    {
      category: "Sales & Operations",
      role: "Operations Lead",
      original: "Handled vendor contracts and daily office supply logistics.",
      enhanced:
        "Negotiated 18 regional supplier master contracts, reducing annual operational procurement spend by $420k without service disruption.",
      metrics: ["$420k Cost Savings", "18 Contracts Negotiated", "Zero Downtime"],
    },
    {
      category: "Finance & Analytics",
      role: "Financial Analyst",
      original: "Built monthly revenue models and created forecast spreadsheets.",
      enhanced:
        "Engineered dynamic 3-statement forecast models in Excel/SQL, identifying $1.8M in revenue leakage and improving quarterly accuracy by 28%.",
      metrics: ["$1.8M Leakage Identified", "+28% Forecast Accuracy", "SQL / Modeling"],
    },
    {
      category: "Product & Management",
      role: "Product Manager",
      original: "Led sprint meetings and launched new mobile app features.",
      enhanced:
        "Directed cross-functional agile team of 8 to ship mobile MVP in 6 weeks, driving 45k downloads with 4.8★ App Store rating.",
      metrics: ["6-Week MVP Ship", "45k Active Downloads", "4.8★ Rating"],
    },
  ];

  const current = DEMOS[selectedDemoIndex];

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#18181B] border border-[#27272A] rounded-3xl p-6 sm:p-8 text-left space-y-6 animate-in fade-in zoom-in-95 duration-200 text-[#FAFAFA]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase text-zinc-300">
            ⚡ LIVE INTERACTIVE TRANSFORMATION DEMO
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#FAFAFA] mt-1">
            Transform Weak Bullets Into Executive STAR Achievements Across Any Role
          </h3>
        </div>

        {/* Role Filter Tabs (Multi-Industry) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#09090B] border border-[#27272A] rounded-2xl">
          {DEMOS.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDemoIndex(idx)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDemoIndex === idx
                  ? "bg-[#FAFAFA] text-[#09090B]"
                  : "text-zinc-400 hover:text-[#FAFAFA]"
              }`}
            >
              {d.category}
            </button>
          ))}
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-zinc-500 uppercase font-bold">Target Position:</span>
        <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-xs font-bold text-[#FAFAFA]">
          {current.role}
        </span>
      </div>

      {/* Comparison Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before: Weak passive */}
        <div className="p-4 sm:p-5 bg-rose-950/20 border border-rose-800/40 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
            ❌ Before: Weak &amp; Passive (Ignored by ATS)
          </span>
          <p className="text-xs text-zinc-400 line-through decoration-rose-500 font-sans leading-relaxed">
            &ldquo;{current.original}&rdquo;
          </p>
          <span className="text-[10px] text-zinc-500 block pt-1">
            No numbers • Vague verbs • Missed keywords
          </span>
        </div>

        {/* After: High impact STAR */}
        <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
            ✅ After: paniund Executive STAR Formula
          </span>
          <p className="text-xs text-[#FAFAFA] font-semibold font-sans leading-relaxed">
            &ldquo;{current.enhanced}&rdquo;
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {current.metrics.map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-emerald-900/40 border border-emerald-700/50 text-[10px] font-bold text-emerald-300"
              >
                + {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instant Hook CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#27272A]">
        <p className="text-xs text-zinc-400 font-medium">
          Ready to optimize your resume for any role with 6 ATS templates in 60 seconds?
        </p>
        <Link
          href="/login"
          className="touch-target px-6 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl border border-[#FAFAFA] transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          <span>Try with Your Resume Free &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
