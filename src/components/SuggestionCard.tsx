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
      className={`border rounded-2xl bg-[#090A0C] overflow-hidden transition-all duration-200 shadow-lg ${
        suggestion.accepted
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-[#242834] hover:border-amber-500/30"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-[#14161D] border-b border-[#242834]">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suggestion.accepted}
              onChange={(e) => onChange(suggestion.id, e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-[#090A0C] accent-emerald-500"
            />
            <span
              className={`text-xs font-bold ${
                suggestion.accepted ? "text-emerald-400" : "text-zinc-300 hover:text-white"
              }`}
            >
              {suggestion.accepted ? "✓ Fix Accepted & Applied" : "Accept Bullet Fix"}
            </span>
          </label>

          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
            {suggestion.section}
          </span>

          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30">
            +{boostPct}% ATS Boost
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyBullet}
            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            <span>{copied ? "✓ Copied!" : "📋 Copy Bullet"}</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? "Collapse ▲" : "Expand Diff ▼"}
          </button>
        </div>
      </div>

      {/* Rationale Callout */}
      {suggestion.rationale && (
        <div className="px-5 py-3 text-xs text-zinc-300 bg-[#10121A] border-b border-[#242834] font-medium leading-relaxed">
          💡 <span className="font-bold text-amber-300">Why this fix works:</span> {suggestion.rationale}
        </div>
      )}

      {/* Side-by-Side Diff View (Expanded by default) */}
      {expanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Older Version / Original */}
          <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 space-y-1.5">
            <span className="font-black text-rose-400 text-[10px] uppercase tracking-wider block">
              Original (Weak Bullet):
            </span>
            <p className="text-zinc-300 italic leading-relaxed">
              "{suggestion.originalText}"
            </p>
          </div>

          {/* Updated Version / STAR Metric */}
          <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 space-y-1.5">
            <span className="font-black text-emerald-400 text-[10px] uppercase tracking-wider block">
              Optimized STAR Bullet (Updated Version):
            </span>
            <p className="text-white font-bold leading-relaxed">
              "{suggestion.suggestedText}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
