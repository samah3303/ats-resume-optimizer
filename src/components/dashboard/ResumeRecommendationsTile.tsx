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
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#003399] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Resume Tips
            </h3>
          </div>
          <span className="text-xs font-mono text-[#767676]">SUGGESTIONS</span>
        </div>

        <div className="space-y-3 text-xs my-4">
          {items.map((rec, idx) => (
            <div
              key={idx}
              className="border border-[#DFDFDF] p-3 rounded-[4px] bg-[#F5F5F5] flex gap-3 items-start"
            >
              <span className="w-5 h-5 bg-[#003399] text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs leading-relaxed text-[#111111]">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
        <div className="text-[11px] text-[#767676] text-center font-medium">
          Updates each time you scan your resume
        </div>
      </div>
    </div>
  );
}
