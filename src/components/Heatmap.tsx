"use client";

interface HeatmapProps {
  keywords: {
    matched: string[];
    missing: string[];
  };
  skills: {
    present: string[];
    missing: string[];
  };
  resumeText?: string;
}

function computeDensity(keyword: string, text: string): number {
  if (!text || !keyword) return 0;
  const regex = new RegExp(
    keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function getOpacityClass(count: number, maxCount: number): string {
  if (maxCount === 0) return "opacity-40";
  const ratio = count / maxCount;
  if (ratio >= 0.8) return "opacity-100 font-semibold";
  if (ratio >= 0.5) return "opacity-75";
  return "opacity-50";
}

export default function Heatmap({
  keywords,
  skills,
  resumeText = "",
}: HeatmapProps) {
  const densities = keywords.matched.map((kw) =>
    computeDensity(kw, resumeText)
  );
  const maxDensity = Math.max(...densities, 1);

  const allMatchedEmpty = keywords.matched.length === 0 && keywords.missing.length === 0;
  const allSkillsEmpty = skills.present.length === 0 && skills.missing.length === 0;

  return (
    <div className="space-y-5">
      {/* Keywords section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          📝 Keyword Density
        </h4>

        {allMatchedEmpty ? (
          <p className="text-sm text-gray-400 italic">
            No keyword data available.
          </p>
        ) : (
          <>
            {/* Matched keywords */}
            {keywords.matched.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Matched ({keywords.matched.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.matched.map((kw, i) => {
                    const density = densities[i];
                    const opacityClass = getOpacityClass(density, maxDensity);
                    return (
                      <span
                        key={kw}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-100 text-green-800 border border-green-200 ${opacityClass} transition-opacity`}
                        title={`${density} occurrence${density !== 1 ? "s" : ""}`}
                      >
                        {density > 0 && (
                          <span className="text-xs font-mono text-green-600">
                            {density}×
                          </span>
                        )}
                        {kw}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {keywords.missing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Missing ({keywords.missing.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.missing.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300 font-medium"
                    >
                      <span className="text-xs">⚠️</span>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Skills section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          🛠️ Skills
        </h4>

        {allSkillsEmpty ? (
          <p className="text-sm text-gray-400 italic">
            No skills data available.
          </p>
        ) : (
          <>
            {/* Present skills */}
            {skills.present.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Present ({skills.present.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.present.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-100 text-green-800 border border-green-200"
                    >
                      <span className="text-xs">✓</span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {skills.missing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Missing ({skills.missing.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.missing.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-800 border border-red-300 font-medium"
                    >
                      <span className="text-xs">⚠️</span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
