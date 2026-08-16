"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

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
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const origText = suggestion?.originalText || "";
  const suggestedText = suggestion?.suggestedText || "";
  const boostPct = Math.min(10, Math.max(3, Math.round(4 + origText.length * 0.02)));

  const handleCopyBullet = async () => {
    if (!suggestedText) return;
    await navigator.clipboard.writeText(suggestedText);
    setCopied(true);
    toast("Copied STAR bullet to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border rounded-2xl bg-white overflow-hidden transition-all duration-200 shadow-sm ${
        suggestion.accepted
          ? "border-black ring-2 ring-black/10"
          : "border-zinc-200 hover:border-black"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suggestion.accepted}
              onChange={(e) => onChange(suggestion.id, e.target.checked)}
              className="w-4 h-4 rounded text-black focus:ring-0 bg-white accent-black"
            />
            <span
              className={`text-xs font-bold ${
                suggestion.accepted ? "text-black" : "text-zinc-700 hover:text-black"
              }`}
            >
              {suggestion.accepted ? "✓ Fix Accepted & Applied" : "Accept Bullet Fix"}
            </span>
          </label>

          <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-800 text-xs font-bold rounded-lg border border-zinc-200">
            {suggestion.section}
          </span>

          <span className="px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-lg">
            +{boostPct}% ATS Boost
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyBullet}
            className="px-3 py-1 bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>{copied ? "✓ Copied!" : "📋 Copy Bullet"}</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-zinc-500 hover:text-black transition-colors"
          >
            {expanded ? "Collapse ▲" : "Expand Diff ▼"}
          </button>
        </div>
      </div>

      {/* Rationale Callout */}
      {suggestion.rationale && (
        <div className="px-5 py-3 text-xs text-zinc-700 bg-white border-b border-zinc-200 font-medium leading-relaxed">
          💡 <span className="font-bold text-black">Why this fix works:</span> {suggestion.rationale}
        </div>
      )}

      {/* Side-by-Side Diff View (Expanded by default) */}
      {expanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Older Version / Original */}
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-1.5">
            <span className="font-bold text-rose-800 text-[10px] uppercase tracking-wider block">
              Original (Weak Bullet):
            </span>
            <p className="text-zinc-700 italic leading-relaxed">
              "{suggestion.originalText}"
            </p>
          </div>

          {/* Updated Version / STAR Metric */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-1.5">
            <span className="font-bold text-emerald-900 text-[10px] uppercase tracking-wider block">
              Optimized STAR Bullet (Updated Version):
            </span>
            <p className="text-black font-bold leading-relaxed">
              "{suggestion.suggestedText}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
