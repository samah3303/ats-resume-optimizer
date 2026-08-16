"use client";

import { VideoExecutivePresenceReport } from "@/lib/ai/video-analytics";

interface VideoReportScorecardProps {
  report: VideoExecutivePresenceReport;
  targetRole: string;
  interviewQuestion: string;
  onRetake: () => void;
}

export function VideoReportScorecard({
  report,
  targetRole,
  interviewQuestion,
  onRetake,
}: VideoReportScorecardProps) {
  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "outstanding":
        return { label: "OUTSTANDING PRESENCE", color: "bg-emerald-100 text-emerald-900 border-emerald-300" };
      case "strong":
        return { label: "STRONG PRESENCE", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "developing":
        return { label: "DEVELOPING PRESENCE", color: "bg-amber-50 text-amber-800 border-amber-200" };
      default:
        return { label: "NEEDS ATTENTION", color: "bg-rose-50 text-rose-800 border-rose-200" };
    }
  };

  const verdictBadge = getVerdictBadge(report.verdict);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1.5">
          <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <span>👁️</span> Executive Video & Posture Diagnostic
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Video Emotion & Executive Composure Report
          </h2>
          <p className="text-xs text-zinc-600">
            Target Role: <strong className="text-black">{targetRole}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-3xl font-black text-black font-mono">
              {report.overallPresenceScore}/100
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              Presence Index
            </span>
          </div>
          <span className={`px-4 py-2 rounded-2xl text-xs font-black border uppercase tracking-wider ${verdictBadge.color}`}>
            {verdictBadge.label}
          </span>
        </div>
      </div>

      {/* Question Context */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
          Interview Prompt Evaluated:
        </span>
        <p className="text-black font-bold font-sans">
          "{interviewQuestion}"
        </p>
      </div>

      {/* Executive Summary */}
      <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-2 shadow-sm">
        <span className="text-xs font-black uppercase tracking-wider text-black block">
          Executive Presentation Debrief
        </span>
        <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-sans">
          {report.summary}
        </p>
      </div>

      {/* Category Radar Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Presence Competency Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Eye Contact", score: report.categoryScores.eyeContactDirectness },
            { label: "Posture Stability", score: report.categoryScores.postureAndStability },
            { label: "Facial Warmth", score: report.categoryScores.facialWarmthAndEngagement },
            { label: "Vocal Energy", score: report.categoryScores.vocalEnergyAndCadence },
            { label: "Stress Resilience", score: report.categoryScores.stressResilience },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-1 shadow-sm"
            >
              <span className="text-xl font-black text-black font-mono block">
                {cat.score}%
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                {cat.label}
              </span>
              <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-black h-full rounded-full"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Priority Fixes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <span>✓</span> Camera & Posture Strengths
          </span>
          <ul className="space-y-2 text-xs text-emerald-950 font-medium list-disc list-inside">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed">
                {str}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span>⚡</span> Priority Body Language Adjustments
          </span>
          <ul className="space-y-2 text-xs text-amber-950 font-medium list-disc list-inside">
            {report.priorityFixes.map((fix, idx) => (
              <li key={idx} className="leading-relaxed">
                {fix}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline Highlights */}
      {report.timelineHighlights && report.timelineHighlights.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Timeline Micro-Expression Review
          </h3>

          <div className="space-y-3">
            {report.timelineHighlights.map((th, idx) => (
              <div
                key={idx}
                className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <span className="font-mono font-bold text-black block">
                    {th.timeRange}
                  </span>
                  <p className="text-zinc-700">{th.observation}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="font-mono font-black text-black text-sm">
                    {th.score}% Composure
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    {th.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Coaching Plan */}
      {report.executiveCoachingPlan && (
        <div className="p-6 bg-zinc-100 border border-zinc-300 rounded-2xl space-y-2 text-xs">
          <span className="font-black uppercase tracking-wider text-black block">
            🎯 Executive Coach Recommendation Plan:
          </span>
          <ul className="space-y-1.5 text-zinc-800 list-disc list-inside">
            {report.executiveCoachingPlan.map((plan, idx) => (
              <li key={idx}>{plan}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
        <button
          onClick={onRetake}
          className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Record Another Video Answer</span>
        </button>
      </div>
    </div>
  );
}
