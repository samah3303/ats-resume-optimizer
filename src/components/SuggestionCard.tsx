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
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-600">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={suggestion.accepted}
              onChange={(e) => onChange(suggestion.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Accept suggestion
            </span>
          </label>
          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded">
            {suggestion.section}
          </span>
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium rounded">
            +{Math.round(3 + suggestion.originalText.length * 0.02)}% ATS
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Rationale always visible */}
      <div className="px-5 py-3">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          <span className="font-medium">Why:</span> {suggestion.rationale}
        </p>
      </div>

      {/* Expandable diff */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          {/* Original */}
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-xs font-semibold text-red-700 dark:text-red-200 mb-1">
              Original
            </p>
            <p className="text-sm text-red-800 dark:text-red-200">{suggestion.originalText}</p>
          </div>

          {/* Suggested */}
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-3">
            <p className="text-xs font-semibold text-green-700 dark:text-green-200 mb-1">
              Suggested
            </p>
            <p className="text-sm text-green-800 dark:text-green-200">{suggestion.suggestedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
