import Link from "next/link";
import { useRouter } from "next/navigation";
import RoadmapOverview from "./RoadmapOverview";
import { Roadmap, ResumeImprovement } from "@/types/dashboard";

interface OnboardingInsightsProps {
  roadmap: Roadmap | null;
  roadmapLoading: boolean;
  onRegenRoadmap: () => void;
  onResetOnboarding: () => void;
  linkedinTips: string[];
  resumeImprovements: ResumeImprovement[];
  expandedInsight: string | null;
  setInsightWithUrl: (key: string | null) => void;
}

export default function OnboardingInsights({
  roadmap,
  roadmapLoading,
  onRegenRoadmap,
  onResetOnboarding,
  linkedinTips,
  resumeImprovements,
  expandedInsight,
  setInsightWithUrl,
}: OnboardingInsightsProps) {
  const router = useRouter();
  const isPostRegen = (roadmap?.generationCount || 1) > 1;

  return (
    <div className="card-premium overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="p-5 border-b border-slate-200/60 dark:border-slate-700/60">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Onboarding Profile & Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Personalized guidance generated from your baseline analysis
        </p>
      </div>

      {/* Accordions */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {/* 1. Roadmap */}
        <div>
          <button
            id="roadmap"
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "roadmap" ? null : "roadmap"
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "roadmap"}
            aria-controls="insight-roadmap"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">🗺️</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Career Roadmap
                </span>
                {roadmap && (
                  <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                    {roadmap.weeks.length}-week plan • Iteration {roadmap.generationCount || 1}
                  </span>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
                expandedInsight === "roadmap" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="insight-roadmap"
            className={`${
              expandedInsight === "roadmap" ? "" : "hidden"
            } px-5 pb-5`}
            role="region"
            aria-labelledby="insight-roadmap-heading"
          >
            <RoadmapOverview
              roadmap={roadmap}
              roadmapLoading={roadmapLoading}
              onRegenRoadmap={onRegenRoadmap}
              onResetOnboarding={onResetOnboarding}
            />
          </div>
        </div>

        {/* 2. ATS Secrets & Application Master Rules */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "ats-rules" ? null : "ats-rules"
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "ats-rules"}
            aria-controls="insight-ats-rules"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💡</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ATS Secrets & Application Master Rules (Aim 75-80%+)
                </span>
                <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-full">
                  Must Read
                </span>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
                expandedInsight === "ats-rules" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="insight-ats-rules"
            className={`${
              expandedInsight === "ats-rules" ? "" : "hidden"
            } px-5 pb-5`}
            role="region"
          >
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl border border-indigo-500/30 shadow-md">
                <h4 className="text-sm font-extrabold text-amber-300 mb-1 flex items-center gap-2">
                  <span>🎯</span> Golden Rule: Run Analysis for EVERY Application & Target 75%–80%+
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Never send the exact same generic resume to two different job postings. Every company uses different ATS algorithms and keyword weights. Open <strong>1-Click Studio</strong> for each application, paste the JD, and tweak your bullet points until your ATS score reaches <strong>75%–80%+</strong> before submitting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold rounded-full uppercase">
                    🛑 Why You Get Instant Rejection Mails
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Automated Cutoff Rules
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Most enterprise ATS tools (Workday, Greenhouse, Taleo) automatically send rejection emails within 2–24 hours to any applicant scoring under 65% match. No human recruiter ever sees these applications.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full uppercase">
                    🕳️ Why You Get No Response At All
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    The Application Black Hole
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    A typical job posting receives 250–500+ resumes. Recruiters sort candidates by ATS match percentage and only review the top 10–15 candidates (top 5%). The remaining 90% sit unread in the system.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase">
                    🤖 How ATS Parsers Actually Read
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Formatting & Phrasing Traps
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Tables, multi-columns, text boxes, and fancy graphics scramble text into broken code. Use clean single-column layouts with exact hard skill phrases (e.g. &quot;React.js&quot; not just &quot;web dev&quot;).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. LinkedIn Optimization & Recruiter Strategy */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "linkedin" ? null : "linkedin"
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "linkedin"}
            aria-controls="insight-linkedin"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💼</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  LinkedIn Optimization & Recruiter Strategy
                </span>
                {isPostRegen ? (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                    ✅ Profile Fixes Applied
                  </span>
                ) : (
                  linkedinTips.length > 0 && (
                    <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                      {linkedinTips.length} custom recommendations
                    </span>
                  )
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
                expandedInsight === "linkedin" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="insight-linkedin"
            className={`${
              expandedInsight === "linkedin" ? "" : "hidden"
            } px-5 pb-5`}
            role="region"
          >
            {isPostRegen ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <strong>Initial LinkedIn Profile Fixes Addressed & Verified!</strong>
                    <p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-400">
                      Your baseline LinkedIn recommendations have been integrated into your career roadmap iteration {roadmap?.generationCount || 2}. Continue utilizing the recruiter hacks below for ongoing applications.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 shadow-lg space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>⚡</span> Recruiter & Job Hunter Master Tips
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>🔔</span> Job Alert Filters: Past 24h & Past Week
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Set up automated alerts filtered strictly by <strong>Posted in last 24 hours</strong>. Applying early places you in the first 25 applicants, boosting recruiter response rates by 4x.
                      </p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>👑</span> 1-Month Free Premium Trial & Benefits
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Claim LinkedIn Premium&apos;s free trial to use 5 free InMail credits, see who viewed your profile, access applicant benchmarks, and gain top applicant badges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : linkedinTips.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-2">
                  Complete your onboarding with a LinkedIn URL to get AI-powered profile tips.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Set up onboarding →
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3">
                  🎯 Resume-to-Target Role Profile Adjustments
                </h4>
                <ul className="space-y-3 mb-6">
                  {linkedinTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3.5 bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-xl"
                    >
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 shadow-lg space-y-3">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>⚡</span> Recruiter & Job Hunter Hack Pack
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-200">
                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>🔔</span> Job Alert Filters: Past 24h & Past Week
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Set up automated alerts filtered strictly by <strong>Posted in last 24 hours</strong> or <strong>Past week</strong>. Applying within 24h places you in the first 25 applicants, boosting recruiter response rates by 4x.
                      </p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>👑</span> 1-Month Free Premium Trial & Benefits
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Claim LinkedIn Premium&apos;s free 30-day trial to get 5 free InMail credits (message hiring managers directly), see who viewed your profile, access applicant competitive benchmarks, and earn the <em>Top Applicant</em> badge.
                      </p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>💼</span> &quot;Open to Work&quot; (Recruiters Only)
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Enable <strong>Recruiters Only</strong> mode to signal 500k+ recruiters actively searching LinkedIn Recruiter dashboard without letting your current employer see it (+40% InMail rate).
                      </p>
                    </div>

                    <div className="p-3 bg-white/10 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>✉️</span> 3–5 Targeted Recruiter Invites Daily
                      </p>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Send 3–5 personalized connection requests per day to talent acquisition managers in your target country. Include job requisition IDs or mutual tech interests.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 4. Resume Improvements */}
        <div>
          <button
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "improvements" ? null : "improvements"
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "improvements"}
            aria-controls="insight-improvements"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">📝</span>
              <div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Resume Improvements & Estimated ATS Boost
                </span>
                {isPostRegen ? (
                  <span className="ml-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                    ✅ Base Fixes Applied
                  </span>
                ) : (
                  resumeImprovements.length > 0 && (
                    <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                      {resumeImprovements.length} suggestions
                    </span>
                  )
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
                expandedInsight === "improvements" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div
            id="insight-improvements"
            className={`${
              expandedInsight === "improvements" ? "" : "hidden"
            } px-5 pb-5`}
            role="region"
          >
            {isPostRegen ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <strong>Initial Resume Improvements Applied & Regenerated!</strong>
                    <p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-400">
                      You have completed initial baseline fixes. For individual job postings, open <strong>1-Click Studio</strong> on your dashboard to optimize your resume to 75-80%+ for specific JDs.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    💡 General Rules for Application-Specific Resume Tuning
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <span>•</span> Always match hard skill spellings exactly as they appear in the job description.
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span> Use STAR bullet formatting (Situation, Task, Action, Result) with numbers & ROI.
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span> Keep your resume single-column, ATS-scannable, without tables or floating text frames.
                    </li>
                  </ul>
                </div>
              </div>
            ) : resumeImprovements.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  Complete your onboarding to get AI-powered resume improvement suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeImprovements.map((imp, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {imp.section}
                      </span>
                      {imp.atsBoost && (
                        <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-extrabold text-xs rounded-full flex items-center gap-1">
                          <span>📈</span> {imp.atsBoost}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                          Current
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 bg-red-50 dark:bg-red-900/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/30">
                          {imp.current}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                          Suggested Rewrite
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-100 dark:border-green-900/30 leading-relaxed">
                          {imp.suggested}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        💡 {imp.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
