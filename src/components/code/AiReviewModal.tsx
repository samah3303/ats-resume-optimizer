"use client";

import { useState } from "react";
import { CodeReviewResult } from "@/lib/ai/code-reviewer";

interface AiReviewModalProps {
  review: CodeReviewResult;
  onClose: () => void;
}

export function AiReviewModal({ review, onClose }: AiReviewModalProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(review.refactoredCodeMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-black rounded-3xl shadow-2xl overflow-hidden text-zinc-900 my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-zinc-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h2 className="text-lg font-black text-black">
                AI Big-O Complexity & Code Review
              </h2>
              <p className="text-xs text-zinc-500">
                Deep algorithmic efficiency analysis and clean code recommendations.
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

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Big-O Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Time Complexity
              </span>
              <div className="text-2xl font-black text-black font-mono">
                {review.timeComplexity}
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                {review.timeExplanation}
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Space Complexity
              </span>
              <div className="text-2xl font-black text-black font-mono">
                {review.spaceComplexity}
              </div>
              <p className="text-[11px] text-zinc-600 leading-snug">
                {review.spaceExplanation}
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Optimization Score
              </span>
              <div className="text-2xl font-black text-black font-mono">
                {review.score}/100
              </div>
              <span className="text-[11px] font-bold text-emerald-700">
                {review.isOptimal ? "⭐ Optimal Solution" : "⚠️ Can Be Optimized"}
              </span>
            </div>
          </div>

          {/* Edge Cases & Bottlenecks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {review.bottlenecks && review.bottlenecks.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                  ⚠️ Bottlenecks Identified
                </span>
                <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                  {review.bottlenecks.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.edgeCasesPassed && review.edgeCasesPassed.length > 0 && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-black block">
                  ✓ Edge Cases Covered
                </span>
                <ul className="space-y-1 text-xs text-zinc-700 list-disc list-inside">
                  {review.edgeCasesPassed.map((ec, idx) => (
                    <li key={idx}>{ec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Refactored Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Optimal Idiomatic Refactoring
              </span>
              <button
                onClick={copyCode}
                className="px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-xl text-xs font-bold text-black shadow-sm"
              >
                {copied ? "✓ Copied" : "Copy Solution"}
              </button>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-mono text-xs text-black leading-relaxed whitespace-pre-wrap select-all">
              {review.refactoredCodeMarkdown}
            </div>
          </div>

          {/* Interview Pro Tips */}
          {review.proTips && review.proTips.length > 0 && (
            <div className="p-4 bg-zinc-100 border border-zinc-300 rounded-2xl space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-black block">
                🎙️ Interviewer Communication Tips
              </span>
              {review.proTips.map((tip, idx) => (
                <p key={idx} className="text-xs text-zinc-700 leading-relaxed">
                  • {tip}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
