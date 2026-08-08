"use client";

interface KeywordDiffProps {
  matched: string[];
  missing: string[];
  presentSkills?: string[];
  missingSkills?: string[];
}

export default function KeywordDiffHighlighter({
  matched = [],
  missing = [],
  presentSkills = [],
  missingSkills = [],
}: KeywordDiffProps) {
  const allMatched = Array.from(new Set([...matched, ...presentSkills]));
  const allMissing = Array.from(new Set([...missing, ...missingSkills]));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Keyword Scannability Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Exact match tags vs missing hard skills required by the ATS filter.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Matched ({allMatched.length})
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Missing ({allMissing.length})
          </span>
        </div>
      </div>

      {/* Matched Keywords */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Matched Keywords & Skills
        </h4>
        {allMatched.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No matched keywords detected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allMatched.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
              >
                <span>✓</span>
                <span>{kw}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Missing Keywords */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
          Missing Target Keywords (High Priority for ATS)
        </h4>
        {allMissing.length === 0 ? (
          <p className="text-xs text-emerald-600 font-medium">🎉 Great job! No major skill gaps detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allMissing.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
              >
                <span>+</span>
                <span>{kw}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
