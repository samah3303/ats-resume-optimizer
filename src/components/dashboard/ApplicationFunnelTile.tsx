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
    <div className="nordic-card p-5 sm:p-7 bg-white border border-nordic-border rounded-2xl sm:rounded-[4px] shadow-xs flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-nordic-border gap-2 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-nordic-primary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Application Funnel & Conversion
            </h3>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-nordic-bg border border-nordic-border rounded-[3px] text-xs font-semibold text-nordic-text">
              <span className="w-2 h-2 rounded-full bg-nordic-success animate-pulse" />
              7-Day Velocity:{" "}
              <strong className="text-nordic-primary">
                {thisWeek} {thisWeek === 1 ? "applied" : "applied"}
              </strong>
              {trend !== 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] ${
                    trend > 0
                      ? "bg-nordic-success/10 text-nordic-success"
                      : "bg-nordic-neutral/10 text-nordic-neutral"
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
          <div className="p-4 bg-nordic-bg border border-nordic-border rounded-xl sm:rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-nordic-neutral mb-1 font-semibold">
              <span className="uppercase tracking-wider">Submitted</span>
              <span className="w-2.5 h-2.5 rounded-full bg-nordic-primary" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-nordic-text leading-none my-1">
              {applied}
            </div>
            <div className="text-[11px] text-nordic-text-secondary flex items-center justify-between mt-2 pt-2 border-t border-nordic-border">
              <span>Pipeline Volume</span>
              <span className="font-mono font-bold text-nordic-primary">100%</span>
            </div>
          </div>

          {/* 2. Response / Interview Rate Metric */}
          <div className="p-4 bg-white border-2 border-nordic-primary rounded-xl sm:rounded-[4px] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-nordic-primary mb-1">
              <span className="uppercase tracking-wider">Interview Rate</span>
              <span className="w-2.5 h-2.5 rounded-full bg-nordic-warning" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-nordic-primary leading-none">
                {responseRate}%
              </span>
              <span className="text-xs font-mono text-nordic-text-secondary">
                ({interviews} {interviews === 1 ? "call" : "calls"})
              </span>
            </div>
            <div className="text-[11px] flex items-center justify-between mt-2 pt-2 border-t border-nordic-border">
              {multiplier ? (
                <span className="font-bold text-nordic-success flex items-center gap-1">
                  <span>🔥</span> {multiplier}x vs avg (6%)
                </span>
              ) : (
                <span className="text-nordic-neutral">Benchmark: 6–8% tech avg</span>
              )}
              <span className="font-mono font-bold text-nordic-warning">
                {interviews > 0 ? `${responseRate}%` : "0%"}
              </span>
            </div>
          </div>

          {/* 3. Offer Metric */}
          <div className="p-4 bg-nordic-bg border border-nordic-border rounded-xl sm:rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-nordic-neutral mb-1 font-semibold">
              <span className="uppercase tracking-wider">Offers Received</span>
              <span className="w-2.5 h-2.5 rounded-full bg-nordic-success" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-nordic-success leading-none my-1">
              {offers}
            </div>
            <div className="text-[11px] text-nordic-text-secondary flex items-center justify-between mt-2 pt-2 border-t border-nordic-border">
              <span>Offer Conversion</span>
              <span className="font-mono font-bold text-nordic-success">
                {offerRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Step-Down Funnel Graph */}
        <div className="p-4 bg-[#F9FAFB] border border-nordic-border rounded-xl sm:rounded-[4px] mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-nordic-text">
            <span className="uppercase tracking-wide text-[11px] text-nordic-neutral">
              Visual Pipeline Progression
            </span>
            <span className="font-mono text-[11px] text-nordic-primary">
              {totalTracked} total tracked (incl. wishlist)
            </span>
          </div>

          {/* Stage 1: Applied Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-nordic-text">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-nordic-primary" />
                1. Applications Submitted
              </span>
              <span className="font-mono">{applied} ({applied > 0 ? "100%" : "0%"})</span>
            </div>
            <div className="h-3 w-full bg-nordic-border rounded-full overflow-hidden">
              <div
                className="h-full bg-nordic-primary rounded-full transition-all duration-500"
                style={{ width: applied > 0 ? "100%" : "0%" }}
              />
            </div>
          </div>

          {/* Stage 2: Screening & Interview Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-nordic-text">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-nordic-warning" />
                2. Screenings & Interviews
              </span>
              <span className="font-mono text-nordic-warning">
                {interviews} ({responseRate}%)
              </span>
            </div>
            <div className="h-3 w-full bg-nordic-border rounded-full overflow-hidden">
              <div
                className="h-full bg-nordic-warning rounded-full transition-all duration-500"
                style={{ width: `${interviewWidthPct}%` }}
              />
            </div>
          </div>

          {/* Stage 3: Offers Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-nordic-text">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-nordic-success" />
                3. Final Offers & Acceptances
              </span>
              <span className="font-mono text-nordic-success">
                {offers} ({offerRate}%)
              </span>
            </div>
            <div className="h-3 w-full bg-nordic-border rounded-full overflow-hidden">
              <div
                className="h-full bg-nordic-success rounded-full transition-all duration-500"
                style={{ width: `${offerWidthPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Motivational Coaching Insight Box */}
        <div className="p-3.5 bg-nordic-primary/5 border-l-4 border-nordic-primary rounded-r-xl sm:rounded-r-[4px] flex items-start gap-3 text-xs">
          <span className="text-lg leading-none shrink-0" aria-hidden="true">
            💡
          </span>
          <div className="space-y-1">
            <span className="font-bold text-nordic-primary uppercase tracking-wide block text-[10px]">
              Funnel Diagnostic & Coaching
            </span>
            <p className="text-nordic-text leading-relaxed">{insight}</p>
            {funnel?.avgMatchScoreInterviewed && (
              <span className="inline-block mt-1 font-mono text-[11px] font-semibold text-nordic-success bg-white px-2 py-0.5 rounded-[2px] border border-nordic-border">
                ✓ Avg ATS match on interview-stage jobs: {funnel.avgMatchScoreInterviewed}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-5 border-t border-nordic-border">
        <span className="text-xs text-nordic-neutral text-center sm:text-left">
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
