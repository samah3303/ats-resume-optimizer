import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResumeImprovement } from "@/types/dashboard";

interface OnboardingInsightsProps {
  onResetOnboarding: () => void;
  linkedinTips: string[];
  resumeImprovements: ResumeImprovement[];
  expandedInsight: string | null;
  setInsightWithUrl: (key: string | null) => void;
}

export default function OnboardingInsights({
  onResetOnboarding,
  linkedinTips,
  resumeImprovements,
  expandedInsight,
  setInsightWithUrl,
}: OnboardingInsightsProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden text-black shadow-sm space-y-0">
      <div className="p-6 border-b border-zinc-100 space-y-2">
        <h2 className="text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
          <span>Onboarding Profile & Insights</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 text-black border border-zinc-200">
            General Baseline Only
          </span>
        </h2>
        <p className="text-xs text-zinc-600 leading-relaxed max-w-3xl">
          💡 <strong>Important Note:</strong> This baseline analysis is general only. Edit your target again after making the suggested changes. You do not need to accept all suggestions—feel free to skip any if you find it is not useful, but try to keep an <strong>80%+ ATS score</strong>.
        </p>
      </div>

      {/* Accordions */}
      <div className="divide-y divide-zinc-100">
        {/* 1. ATS Secrets & Application Master Rules */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "ats-rules" ? null : "ats-rules"
              )
            }
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "ats-rules"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💡</span>
              <div>
                <span className="text-xs font-bold text-black">
                  ATS Secrets & Application Rules (Aim for 80%+)
                </span>
                <span className="ml-2 px-2.5 py-0.5 bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-full">
                  Must Read
                </span>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${
                expandedInsight === "ats-rules" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="insight-ats-rules"
            className={`${
              expandedInsight === "ats-rules" ? "" : "hidden"
            } px-6 pb-6`}
          >
            <div className="space-y-4">
              <div className="p-5 bg-zinc-50 text-black rounded-2xl border border-zinc-200 shadow-sm space-y-1">
                <h4 className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-wider">
                  <span>🎯</span> Target 80%+ ATS Score
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Remember: This baseline score is general only. For every specific job application, click <strong>+ Run New Analysis</strong>, paste the job description, and apply fixes until your ATS score reaches <strong>80%+</strong>. You can skip any suggestion that doesn't fit your experience!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-sm">
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-full uppercase">
                    🛑 Cutoff Rules
                  </span>
                  <h5 className="text-xs font-bold text-black">
                    Automated Cutoff Filters
                  </h5>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Enterprise ATS systems automatically filter out applicants scoring under 65% match. Aim for 80%+ to reach top reviewer pools.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-sm">
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-full uppercase">
                    🕳️ Recruiter Sort
                  </span>
                  <h5 className="text-xs font-bold text-black">
                    Top 5% Candidate Pool
                  </h5>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Recruiters sort hundreds of candidates by match score and usually invite only the top 5–10% to initial phone screens.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-sm">
                  <span className="px-2.5 py-0.5 bg-zinc-100 text-black border border-zinc-200 text-[10px] font-bold rounded-full uppercase">
                    🤖 Formatting Traps
                  </span>
                  <h5 className="text-xs font-bold text-black">
                    Keep Layouts Clean
                  </h5>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Avoid complex graphics or multi-column tables. Stick to clean, scannable layouts with exact target skill phrases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. LinkedIn Optimization & Recruiter Strategy */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "linkedin" ? null : "linkedin"
              )
            }
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "linkedin"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💼</span>
              <div>
                <span className="text-xs font-bold text-black">
                  LinkedIn Optimization & Recruiter Strategy
                </span>
                {linkedinTips.length > 0 && (
                  <span className="ml-2 text-xs text-zinc-500 font-mono">
                    ({linkedinTips.length} Actionable Tips)
                  </span>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${
                expandedInsight === "linkedin" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="insight-linkedin"
            className={`${
              expandedInsight === "linkedin" ? "" : "hidden"
            } px-6 pb-6`}
          >
            {linkedinTips.length > 0 ? (
              <div className="space-y-3">
                {linkedinTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No LinkedIn tips generated yet. Run target edit to refresh insights.
              </p>
            )}
          </div>
        </div>

        {/* 3. Baseline Resume Gaps */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "improvements" ? null : "improvements"
              )
            }
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "improvements"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">🎯</span>
              <div>
                <span className="text-xs font-bold text-black">
                  Baseline Resume Gaps & Priority Fixes
                </span>
                {resumeImprovements.length > 0 && (
                  <span className="ml-2 text-xs text-zinc-500 font-mono">
                    ({resumeImprovements.length} Recommendations)
                  </span>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${
                expandedInsight === "improvements" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="insight-improvements"
            className={`${
              expandedInsight === "improvements" ? "" : "hidden"
            } px-6 pb-6`}
          >
            {resumeImprovements.length > 0 ? (
              <div className="space-y-3">
                {resumeImprovements.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-black border border-zinc-200">
                        {item.section || "General Improvement"}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">
                        Priority {i + 1}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                      {item.suggested || item.current}
                    </p>
                    {item.reason && (
                      <p className="text-[11px] text-zinc-500 italic">
                        💡 {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                No priority fixes generated. Your baseline resume structure looks clean!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
