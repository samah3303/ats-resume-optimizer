"use client";

import { useState } from "react";

interface Suggestion {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
  accepted: boolean;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onChange: (id: string, accepted: boolean) => void;
}

export default function SuggestionCard({
  suggestion,
  onChange,
}: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(true);

  const boostPct = Math.min(10, Math.max(3, Math.round(4 + suggestion.originalText.length * 0.02)));

  return (
    <div
      className={`border rounded-2xl bg-white dark:bg-slate-800 overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${
        suggestion.accepted
          ? "border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-500"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suggestion.accepted}
              onChange={(e) => onChange(suggestion.id, e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-slate-700 accent-emerald-600"
            />
            <span className={`text-xs font-bold ${suggestion.accepted ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
              {suggestion.accepted ? "✓ Suggestion Accepted" : "Accept Suggestion"}
            </span>
          </label>

          <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-md border border-indigo-200 dark:border-indigo-800">
            {suggestion.section}
          </span>

          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-md border border-emerald-200 dark:border-emerald-800">
            +{boostPct}% ATS Score
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {expanded ? "Collapse ▲" : "Expand Diff ▼"}
        </button>
      </div>

      {/* Rationale Callout */}
      {suggestion.rationale && (
        <div className="px-5 py-3 text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/30 dark:bg-indigo-950/20 border-b border-slate-100 dark:border-slate-800 font-medium">
          💡 <span className="font-bold text-indigo-900 dark:text-indigo-300">Why:</span> {suggestion.rationale}
        </div>
      )}

      {/* Side-by-Side Diff View (Expanded by default) */}
      {expanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Older Version / Original */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/30 p-4 space-y-1">
            <span className="font-bold text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wider block">
              Original (Older Bullet):
            </span>
            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed">
              "{suggestion.originalText}"
            </p>
          </div>

          {/* Updated Version / STAR Metric */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 space-y-1">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider block">
              Optimized STAR Fix (Updated Version):
            </span>
            <p className="text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
              "{suggestion.suggestedText}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
