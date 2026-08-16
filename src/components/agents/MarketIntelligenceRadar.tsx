"use client";

import { MarketPulseData } from "@/lib/market/intelligence";

interface MarketIntelligenceRadarProps {
  data: MarketPulseData;
}

export function MarketIntelligenceRadar({ data }: MarketIntelligenceRadarProps) {
  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            Active Indexed Jobs (Adzuna/Remotive)
          </span>
          <div className="text-2xl font-black text-black font-mono">
            {data.totalActiveIndexedJobs.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-700 font-bold block">
            +4,820 new listings added today
          </span>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            Remote Hiring Ratio
          </span>
          <div className="text-2xl font-black text-black font-mono">
            {data.remoteHiringRatioPercent}%
          </div>
          <span className="text-xs text-zinc-600 block">
            68% Remote / 32% Hybrid
          </span>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-3xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
            Engineering Hiring Sentiment
          </span>
          <div className="text-base font-black text-black">
            {data.hiringSentiment}
          </div>
          <span className="text-xs text-emerald-700 font-bold block">
            High-velocity Q3 Expansion
          </span>
        </div>
      </div>

      {/* Market Takeaway */}
      <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1.5 shadow-sm text-xs">
        <span className="font-black uppercase tracking-wider text-black block">
          📡 Market Radar Macro Intelligence Takeaway:
        </span>
        <p className="text-zinc-800 leading-relaxed font-medium">
          {data.keyTakeaway}
        </p>
      </div>

      {/* Salary Surge Skills & Top Hiring Companies Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Salary Surge Skills */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <h3 className="text-sm font-black text-black flex items-center gap-1.5">
              <span>📈</span> Critical Salary Surge Skills (YoY)
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-500">Live Pulse</span>
          </div>

          <div className="space-y-3">
            {data.topSalarySurgeSkills.map((skill, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-black text-black">{skill.skill}</h4>
                  <span className="text-[10px] text-zinc-500">
                    Category: {skill.category} • Avg: ${(skill.averageSalaryUsd / 1000).toFixed(0)}k/yr
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-black text-emerald-700 text-sm block">
                    +{skill.growthPercentage}%
                  </span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    {skill.demandLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <h3 className="text-sm font-black text-black flex items-center gap-1.5">
              <span>🏢</span> Companies in Aggressive Hiring Mode
            </h3>
            <span className="text-[10px] font-bold uppercase text-zinc-500">Tracked Orgs</span>
          </div>

          <div className="space-y-3">
            {data.topHiringCompanies.map((comp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-black">{comp.name}</h4>
                    <span className="text-[10px] text-zinc-500">{comp.industry}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-200 text-zinc-900 text-[10px] font-bold">
                    {comp.openRolesCount} Open Roles
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {comp.hotRoles.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md text-[10px] font-medium text-black"
                    >
                      {r}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60">
                  <span>Comp: <strong className="text-black">{comp.averageCompensationRange}</strong></span>
                  <span className="font-bold text-zinc-700">{comp.hiringPace}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
