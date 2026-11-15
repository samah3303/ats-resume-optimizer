"use client";

import Link from "next/link";
import { FunnelAnalytics } from "@/types";

interface ApplicationFunnelTileProps {
  funnel?: FunnelAnalytics;
  totalTracked?: number;
}

export default function ApplicationFunnelTile({
  funnel,
  totalTracked = 0,
}: ApplicationFunnelTileProps) {
  const applied = funnel?.appliedCount ?? 0;
  const interviews = funnel?.interviewCount ?? 0;
  const offers = funnel?.offerCount ?? 0;
  const responseRate = funnel?.responseRate ?? 0;
  const offerRate = funnel?.offerRate ?? 0;
  const thisWeek = funnel?.thisWeekApplied ?? 0;
  const trend = funnel?.weeklyTrend ?? 0;
  const multiplier = funnel?.benchmarkMultiplier ?? null;
  const insight =
    funnel?.coachingInsight ||
    "Track your applications from submission to offer and benchmark your interview conversion against industry averages.";

  // Calculate funnel percentage widths (minimum 8% for visibility)
  const interviewWidthPct =
    applied > 0 ? Math.max(Math.min((interviews / applied) * 100, 100), interviews > 0 ? 12 : 0) : 0;
  const offerWidthPct =
    applied > 0 ? Math.max(Math.min((offers / applied) * 100, 100), offers > 0 ? 8 : 0) : 0;

  return (
    <div className="nordic-card p-5 sm:p-7 bg-white border border-[#DFDFDF] rounded-2xl sm:rounded-[4px] shadow-xs flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#DFDFDF] gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-[#003399] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Application Funnel & Conversion
            </h3>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[3px] text-xs font-semibold text-[#111111]">
              <span className="w-2 h-2 rounded-full bg-[#0A8A00] animate-pulse" />
              7-Day Velocity:{" "}
              <strong className="text-[#003399]">
                {thisWeek} {thisWeek === 1 ? "applied" : "applied"}
              </strong>
              {trend !== 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                    trend > 0
                      ? "bg-[#0A8A00]/10 text-[#0A8A00]"
                      : "bg-[#767676]/10 text-[#767676]"
                  }`}
                >
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 3 Core Funnel KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          {/* 1. Applied Metric */}
          <div className="p-4 bg-[#F5F5F5] border border-[#DFDFDF] rounded-xl sm:rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#767676] mb-1 font-semibold">
              <span className="uppercase tracking-wider">Submitted</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#003399]" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#111111] leading-none my-1">
              {applied}
            </div>
            <div className="text-[11px] text-[#484848] flex items-center justify-between mt-2 pt-2 border-t border-[#DFDFDF]">
              <span>Pipeline Volume</span>
              <span className="font-mono font-bold text-[#003399]">100%</span>
            </div>
          </div>

          {/* 2. Response / Interview Rate Metric */}
          <div className="p-4 bg-white border-2 border-[#003399] rounded-xl sm:rounded-[4px] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#003399] mb-1">
              <span className="uppercase tracking-wider">Interview Rate</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#E87400]" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-[#003399] leading-none">
                {responseRate}%
              </span>
              <span className="text-xs font-mono text-[#484848]">
                ({interviews} {interviews === 1 ? "call" : "calls"})
              </span>
            </div>
            <div className="text-[11px] flex items-center justify-between mt-2 pt-2 border-t border-[#DFDFDF]">
              {multiplier ? (
                <span className="font-bold text-[#0A8A00] flex items-center gap-1">
                  <span>🔥</span> {multiplier}x vs avg (6%)
                </span>
              ) : (
                <span className="text-[#767676]">Benchmark: 6–8% tech avg</span>
              )}
              <span className="font-mono font-bold text-[#E87400]">
                {interviews > 0 ? `${responseRate}%` : "0%"}
              </span>
            </div>
          </div>

          {/* 3. Offer Metric */}
          <div className="p-4 bg-[#F5F5F5] border border-[#DFDFDF] rounded-xl sm:rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#767676] mb-1 font-semibold">
              <span className="uppercase tracking-wider">Offers Received</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0A8A00]" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0A8A00] leading-none my-1">
              {offers}
            </div>
            <div className="text-[11px] text-[#484848] flex items-center justify-between mt-2 pt-2 border-t border-[#DFDFDF]">
              <span>Offer Conversion</span>
              <span className="font-mono font-bold text-[#0A8A00]">
                {offerRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Step-Down Funnel Graph */}
        <div className="p-4 bg-[#F9FAFB] border border-[#DFDFDF] rounded-xl sm:rounded-[4px] mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
            <span className="uppercase tracking-wide text-[11px] text-[#767676]">
              Visual Pipeline Progression
            </span>
            <span className="font-mono text-[11px] text-[#003399]">
              {totalTracked} total tracked (incl. wishlist)
            </span>
          </div>

          {/* Stage 1: Applied Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-[#111111]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#003399]" />
                1. Applications Submitted
              </span>
              <span className="font-mono">{applied} ({applied > 0 ? "100%" : "0%"})</span>
            </div>
            <div className="h-3 w-full bg-[#DFDFDF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003399] rounded-full transition-all duration-500"
                style={{ width: applied > 0 ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Stage 2: Screening & Interview Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-[#111111]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E87400]" />
                2. Screenings & Interviews
              </span>
              <span className="font-mono text-[#E87400]">
                {interviews} ({responseRate}%)
              </span>
            </div>
            <div className="h-3 w-full bg-[#DFDFDF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E87400] rounded-full transition-all duration-500"
                style={{ width: `${interviewWidthPct}%` }}
              />
            </div>
          </div>

          {/* Stage 3: Offers Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-[#111111]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0A8A00]" />
                3. Final Offers & Acceptances
              </span>
              <span className="font-mono text-[#0A8A00]">
                {offers} ({offerRate}%)
              </span>
            </div>
            <div className="h-3 w-full bg-[#DFDFDF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0A8A00] rounded-full transition-all duration-500"
                style={{ width: `${offerWidthPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Motivational Coaching Insight Box */}
        <div className="p-3.5 bg-[#003399]/5 border-l-4 border-[#003399] rounded-r-xl sm:rounded-r-[4px] flex items-start gap-3 text-xs">
          <span className="text-lg leading-none shrink-0" aria-hidden="true">
            💡
          </span>
          <div className="space-y-1">
            <span className="font-bold text-[#003399] uppercase tracking-wide block text-[10px]">
              Funnel Diagnostic & Coaching
            </span>
            <p className="text-[#111111] leading-relaxed">{insight}</p>
            {funnel?.avgMatchScoreInterviewed && (
              <span className="inline-block mt-1 font-mono text-[11px] font-semibold text-[#0A8A00] bg-white px-2 py-0.5 rounded-[2px] border border-[#DFDFDF]">
                ✓ Avg ATS match on interview-stage jobs: {funnel.avgMatchScoreInterviewed}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-[#DFDFDF]">
        <span className="text-xs text-[#767676] text-center sm:text-left">
          Updated continuously as you drag cards in your tracker.
        </span>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/dashboard/jobs"
            className="nordic-btn-secondary text-xs h-9 px-4 font-bold flex-1 sm:flex-initial text-center justify-center flex items-center gap-1"
          >
            <span>+ Find Jobs</span>
          </Link>
          <Link
            href="/dashboard/tracker"
            className="nordic-btn-primary text-xs h-9 px-4 font-bold flex-1 sm:flex-initial text-center justify-center flex items-center gap-1"
          >
            <span>View Tracker</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
