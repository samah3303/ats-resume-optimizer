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
    <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white">
            Keyword Scannability Breakdown
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Exact match tags vs missing hard skills required by the ATS filter.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Matched ({allMatched.length})
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Missing ({allMissing.length})
          </span>
        </div>
      </div>

      {/* Matched Keywords */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-2.5">
          Matched Keywords & Skills
        </h4>
        {allMatched.length === 0 ? (
          <p className="text-xs text-zinc-500 italic">No matched keywords detected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allMatched.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800"
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
        <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-300 mb-2.5">
          Missing Target Keywords (High Priority for ATS)
        </h4>
        {allMissing.length === 0 ? (
          <p className="text-xs text-emerald-400 font-bold">🎉 Great job! No major skill gaps detected.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allMissing.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800"
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
