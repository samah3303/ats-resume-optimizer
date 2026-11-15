"use client";

interface ResumeRecommendationsTileProps {
  recommendations: string[];
}

export default function ResumeRecommendationsTile({
  recommendations,
}: ResumeRecommendationsTileProps) {
  const defaultRecs = [
    "Add real numbers and results (like '% faster' or 'projects delivered') to your past work.",
    "Keep job titles and dates simple so hiring managers can skim easily.",
    "Include the top skills mentioned in the job descriptions you want to apply for.",
  ];

  const items = recommendations.length > 0 ? recommendations.slice(0, 3) : defaultRecs;

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-primary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Resume Tips
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-neutral">SUGGESTIONS</span>
        </div>

        <div className="space-y-3 text-xs my-4">
          {items.map((rec, idx) => (
            <div
              key={idx}
              className="border border-nordic-border p-3 rounded-[4px] bg-nordic-bg flex gap-3 items-start"
            >
              <span className="w-5 h-5 bg-nordic-primary text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs leading-relaxed text-nordic-text">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <div className="text-[11px] text-nordic-neutral text-center font-medium">
          Updates each time you scan your resume
        </div>
      </div>
    </div>
  );
}
