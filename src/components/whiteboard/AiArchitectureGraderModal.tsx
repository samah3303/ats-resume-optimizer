"use client";

import { ArchitectureGradeResult } from "@/lib/ai/architecture-grader";

interface AiArchitectureGraderModalProps {
  result: ArchitectureGradeResult;
  onClose: () => void;
}

export function AiArchitectureGraderModal({
  result,
  onClose,
}: AiArchitectureGraderModalProps) {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-emerald-100 text-emerald-900 border-emerald-300";
    if (grade.startsWith("B")) return "bg-zinc-100 text-black border-zinc-300";
    return "bg-amber-100 text-amber-900 border-amber-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-black rounded-3xl shadow-2xl overflow-hidden text-zinc-900 my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-zinc-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <h2 className="text-lg font-black text-black">
                AI System Architecture Evaluation Scorecard
              </h2>
              <p className="text-xs text-zinc-500">
                Distributed systems scalability, single point of failure (SPOF) audit & capacity math.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center text-sm border border-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Top Grade Banner */}
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                Executive Architecture Debrief
              </span>
              <p className="text-xs sm:text-sm text-zinc-900 leading-relaxed font-sans font-medium">
                {result.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-3xl font-black text-black font-mono">
                  {result.overallScore}/100
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                  Architecture Score
                </span>
              </div>
              <span
                className={`px-4 py-2 rounded-2xl text-xl font-black border uppercase tracking-wider ${getGradeColor(
                  result.letterGrade
                )}`}
              >
                {result.letterGrade}
              </span>
            </div>
          </div>

          {/* Pillars Radar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white border border-zinc-200 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-2xl font-black text-black font-mono block">
                {result.scalabilityRating}%
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Scalability Rating
              </span>
            </div>
            <div className="p-4 bg-white border border-zinc-200 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-2xl font-black text-black font-mono block">
                {result.reliabilityRating}%
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Reliability & Fault-Tolerance
              </span>
            </div>
            <div className="p-4 bg-white border border-zinc-200 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-2xl font-black text-black font-mono block">
                {result.costEfficiencyRating}%
              </span>
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Cost & Infrastructure Efficiency
              </span>
            </div>
          </div>

          {/* Back-of-the-Envelope Capacity Estimations */}
          {result.backOfEnvelopeEstimations && (
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 font-mono text-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-black block font-sans">
                📊 Back-of-the-Envelope Capacity Calculations
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block">Projected Peak Throughput:</span>
                  <span className="font-bold text-black">{result.backOfEnvelopeEstimations.projectedQps}</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block">Daily Storage Delta:</span>
                  <span className="font-bold text-black">{result.backOfEnvelopeEstimations.dailyStorage}</span>
                </div>
                <div className="p-3 bg-white border border-zinc-200 rounded-xl">
                  <span className="text-zinc-500 text-[10px] block">Network Bandwidth:</span>
                  <span className="font-bold text-black">{result.backOfEnvelopeEstimations.bandwidthRequirements}</span>
                </div>
              </div>
            </div>
          )}

          {/* SPOF Warnings */}
          {result.singlePointsOfFailure && result.singlePointsOfFailure.length > 0 ? (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs">
              <span className="font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <span>⚠️</span> Single Points of Failure (SPOFs) Identified:
              </span>
              <div className="space-y-2">
                {result.singlePointsOfFailure.map((spof, idx) => (
                  <div key={idx} className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                    <strong className="text-rose-950 block">{spof.component}: {spof.description}</strong>
                    <span className="text-emerald-800 font-medium block">
                      💡 Fix: {spof.mitigation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium">
              ✓ Zero Critical Single Points of Failure detected. Architecture features proper redundancy across compute and storage tiers.
            </div>
          )}

          {/* Optimal Recommendations */}
          {result.optimalRecommendations && (
            <div className="p-5 bg-zinc-100 border border-zinc-300 rounded-2xl space-y-2 text-xs">
              <span className="font-black uppercase tracking-wider text-black block">
                💡 Staff Architect Recommendations:
              </span>
              <ul className="space-y-1.5 text-zinc-800 list-disc list-inside">
                {result.optimalRecommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}
