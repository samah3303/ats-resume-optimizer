"use client";

import { AtsBreakdown } from "@/types";

interface AtsScoreTileProps {
  score: number | null;
  breakdown?: AtsBreakdown | null;
  onReanalyze?: () => void;
  analyzing?: boolean;
}

export default function AtsScoreTile({
  score,
  breakdown,
  onReanalyze,
  analyzing,
}: AtsScoreTileProps) {
  const displayScore = score ?? 0;

  const getScoreBadge = (val: number) => {
    if (val >= 80) return { bg: "bg-nordic-success", text: "text-white", label: "GREAT" };
    if (val >= 60) return { bg: "bg-nordic-warning", text: "text-white", label: "GOOD" };
    return { bg: "bg-nordic-error", text: "text-white", label: "NEEDS WORK" };
  };

  const badge = getScoreBadge(displayScore);

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-primary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Resume Score
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-neutral">OUT OF 100</span>
        </div>

        {/* Primary Score Readout */}
        <div className="flex items-center justify-between my-4 p-4 bg-nordic-bg rounded-[4px] border border-nordic-border">
          <div>
            <div className="text-4xl font-bold tracking-tight text-nordic-text leading-none font-mono">
              {displayScore}
              <span className="text-lg font-normal text-nordic-neutral">/100</span>
            </div>
            <div className="text-xs font-medium text-nordic-text-secondary mt-2">
              {displayScore >= 80
                ? "Your resume is strong and ready to send."
                : displayScore >= 60
                ? "Good start. A few simple fixes will improve it."
                : "Needs changes to pass hiring filters."}
            </div>
          </div>

          <div
            className={`w-14 h-14 rounded-[4px] flex flex-col items-center justify-center font-bold text-xs ${badge.bg} ${badge.text} shadow-xs shrink-0`}
          >
            <span className="text-base leading-none font-black">{displayScore}%</span>
            <span className="text-[10px] uppercase font-mono mt-0.5 tracking-wider">{badge.label}</span>
          </div>
        </div>

        {/* Sub-Metric Breakdowns */}
        {breakdown && (
          <div className="space-y-3 text-xs my-4">
            <div>
              <div className="flex justify-between mb-1 text-nordic-text-secondary font-medium">
                <span>Keyword Match</span>
                <span className="font-mono font-bold text-nordic-text">{breakdown.keywordScore}%</span>
              </div>
              <div className="h-2 w-full bg-[#EAEAEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-nordic-primary rounded-full transition-all duration-300"
                  style={{ width: `${breakdown.keywordScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-nordic-text-secondary font-medium">
                <span>Layout & Formatting</span>
                <span className="font-mono font-bold text-nordic-text">{breakdown.formatScore}%</span>
              </div>
              <div className="h-2 w-full bg-[#EAEAEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-nordic-secondary rounded-full transition-all duration-300"
                  style={{ width: `${breakdown.formatScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-nordic-text-secondary font-medium">
                <span>Action Words & Results</span>
                <span className="font-mono font-bold text-nordic-text">{breakdown.impactScore}%</span>
              </div>
              <div className="h-2 w-full bg-[#EAEAEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-nordic-success rounded-full transition-all duration-300"
                  style={{ width: `${breakdown.impactScore}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <button
          onClick={onReanalyze}
          disabled={analyzing}
          className="nordic-btn-primary w-full text-xs h-10 font-bold uppercase tracking-wide cursor-pointer disabled:opacity-50"
        >
          {analyzing ? "Scanning..." : "Scan Resume Again"}
        </button>
      </div>
    </div>
  );
}
