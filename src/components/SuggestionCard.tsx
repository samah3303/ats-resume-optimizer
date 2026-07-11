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
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={suggestion.accepted}
              onChange={(e) => onChange(suggestion.id, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Accept suggestion
            </span>
          </label>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
            {suggestion.section}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Rationale always visible */}
      <div className="px-5 py-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Why:</span> {suggestion.rationale}
        </p>
      </div>

      {/* Expandable diff */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          {/* Original */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">
              Original
            </p>
            <p className="text-sm text-red-800">{suggestion.originalText}</p>
          </div>

          {/* Suggested */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-xs font-semibold text-green-700 mb-1">
              Suggested
            </p>
            <p className="text-sm text-green-800">{suggestion.suggestedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
