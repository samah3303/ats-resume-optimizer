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
    <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] overflow-hidden text-white shadow-xl">
      <div className="p-5 border-b border-[#242834]">
        <h2 className="text-sm font-black text-white uppercase tracking-wider">
          Onboarding Profile & Insights
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Personalized guidance generated from your baseline analysis
        </p>
      </div>

      {/* Accordions */}
      <div className="divide-y divide-[#242834]">
        {/* 1. Roadmap */}
        <div>
          <button
            id="roadmap"
            onClick={() =>
              setInsightWithUrl(
                expandedInsight === "roadmap" ? null : "roadmap"
              )
            }
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1C1F2B]/60 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "roadmap"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">🗺️</span>
              <div>
                <span className="text-xs font-black text-white">
                  Career Roadmap
                </span>
                {roadmap && (
                  <span className="ml-2 text-xs text-zinc-500 font-mono">
                    {roadmap.weeks.length}-week plan • Iteration {roadmap.generationCount || 1}
                  </span>
                )}
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-zinc-500 transition-transform ${
                expandedInsight === "roadmap" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            id="insight-roadmap"
            className={`${
              expandedInsight === "roadmap" ? "" : "hidden"
            } px-5 pb-5`}
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
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1C1F2B]/60 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "ats-rules"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💡</span>
              <div>
                <span className="text-xs font-black text-white">
                  ATS Secrets & Application Master Rules (Aim 75-80%+)
                </span>
                <span className="ml-2 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded-full">
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
            } px-5 pb-5`}
          >
            <div className="space-y-4">
              <div className="p-5 bg-[#090A0C] text-white rounded-2xl border border-amber-500/30 shadow-lg">
                <h4 className="text-xs font-black text-amber-300 mb-1 flex items-center gap-2 uppercase tracking-wider">
                  <span>🎯</span> Golden Rule: Run Analysis for EVERY Application & Target 75%–80%+
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Never send the exact same generic resume to two different job postings. Every company uses different ATS algorithms and keyword weights. Open <strong>1-Click Studio</strong> for each application, paste the JD, and tweak your bullet points until your ATS score reaches <strong>75%–80%+</strong> before submitting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-2">
                  <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black rounded-full uppercase">
                    🛑 Why You Get Instant Rejections
                  </span>
                  <h5 className="text-xs font-bold text-white">
                    Automated Cutoff Rules
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Most enterprise ATS tools (Workday, Greenhouse, Taleo) automatically send rejection emails within 2–24 hours to any applicant scoring under 65% match.
                  </p>
                </div>

                <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-2">
                  <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black rounded-full uppercase">
                    🕳️ The Black Hole
                  </span>
                  <h5 className="text-xs font-bold text-white">
                    Application Black Hole
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    A typical job posting receives 250–500+ resumes. Recruiters sort candidates by ATS match percentage and only review top 5%.
                  </p>
                </div>

                <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-2">
                  <span className="px-2.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black rounded-full uppercase">
                    🤖 How Parsers Read
                  </span>
                  <h5 className="text-xs font-bold text-white">
                    Formatting & Phrasing Traps
                  </h5>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Tables, multi-columns, text boxes, and fancy graphics scramble text into broken code. Use clean single-column layouts with exact hard skill phrases.
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
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1C1F2B]/60 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "linkedin"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">💼</span>
              <div>
                <span className="text-xs font-black text-white">
                  LinkedIn Optimization & Recruiter Strategy
                </span>
                {isPostRegen ? (
                  <span className="ml-2 px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black rounded-full">
                    ✅ Profile Fixes Applied
                  </span>
                ) : (
                  linkedinTips.length > 0 && (
                    <span className="ml-2 text-xs text-zinc-500 font-mono">
                      {linkedinTips.length} custom recommendations
                    </span>
                  )
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
            } px-5 pb-5`}
          >
            {isPostRegen ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-300 leading-relaxed flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <strong>Initial LinkedIn Profile Fixes Addressed & Verified!</strong>
                    <p className="mt-0.5 text-[11px] text-emerald-400">
                      Your baseline LinkedIn recommendations have been integrated into your career roadmap iteration {roadmap?.generationCount || 2}. Continue utilizing the recruiter hacks below for ongoing applications.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-[#090A0C] text-white rounded-2xl border border-amber-500/30 shadow-lg space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <span>⚡</span> Recruiter & Job Hunter Master Tips
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>🔔</span> Job Alert Filters: Past 24h & Past Week
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Set up automated alerts filtered strictly by <strong>Posted in last 24 hours</strong>. Applying early places you in the first 25 applicants, boosting recruiter response rates by 4x.
                      </p>
                    </div>

                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>👑</span> 1-Month Free Premium Trial & Benefits
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Claim LinkedIn Premium&apos;s free trial to use 5 free InMail credits, see who viewed your profile, access applicant benchmarks, and gain top applicant badges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : linkedinTips.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-zinc-400 mb-2">
                  Complete your onboarding with a LinkedIn URL to get AI-powered profile tips.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="text-xs text-amber-400 font-bold hover:underline"
                >
                  Set up onboarding →
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-3">
                  🎯 Resume-to-Target Role Profile Adjustments
                </h4>
                <ul className="space-y-3 mb-6">
                  {linkedinTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3.5 bg-[#090A0C] border border-[#242834] rounded-2xl"
                    >
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="p-5 bg-[#090A0C] text-white rounded-2xl border border-amber-500/30 shadow-lg space-y-3">
                  <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <span>⚡</span> Recruiter & Job Hunter Hack Pack
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-300">
                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>🔔</span> Job Alert Filters: Past 24h & Past Week
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Set up automated alerts filtered strictly by <strong>Posted in last 24 hours</strong> or <strong>Past week</strong>. Applying within 24h places you in the first 25 applicants, boosting recruiter response rates by 4x.
                      </p>
                    </div>

                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>👑</span> 1-Month Free Premium Trial & Benefits
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Claim LinkedIn Premium&apos;s free 30-day trial to get 5 free InMail credits (message hiring managers directly), see who viewed your profile, access applicant competitive benchmarks, and earn the <em>Top Applicant</em> badge.
                      </p>
                    </div>

                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>💼</span> &quot;Open to Work&quot; (Recruiters Only)
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Enable <strong>Recruiters Only</strong> mode to signal 500k+ recruiters actively searching LinkedIn Recruiter dashboard without letting your current employer see it (+40% InMail rate).
                      </p>
                    </div>

                    <div className="p-3 bg-[#14161D] rounded-xl border border-[#242834] space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1">
                        <span>✉️</span> 3–5 Targeted Recruiter Invites Daily
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
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
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1C1F2B]/60 transition-colors min-h-[44px]"
            aria-expanded={expandedInsight === "improvements"}
          >
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-lg">📝</span>
              <div>
                <span className="text-xs font-black text-white">
                  Resume Improvements & Estimated ATS Boost
                </span>
                {isPostRegen ? (
                  <span className="ml-2 px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black rounded-full">
                    ✅ Base Fixes Applied
                  </span>
                ) : (
                  resumeImprovements.length > 0 && (
                    <span className="ml-2 text-xs text-zinc-500 font-mono">
                      {resumeImprovements.length} suggestions
                    </span>
                  )
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
            } px-5 pb-5`}
          >
            {isPostRegen ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-300 leading-relaxed flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <div>
                    <strong>Initial Resume Improvements Applied & Regenerated!</strong>
                    <p className="mt-0.5 text-[11px] text-emerald-400">
                      You have completed initial baseline fixes. For individual job postings, open <strong>1-Click Studio</strong> on your dashboard to optimize your resume to 75-80%+ for specific JDs.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-2">
                  <h4 className="text-xs font-bold text-white">
                    💡 General Rules for Application-Specific Resume Tuning
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-400">
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
                <p className="text-xs text-zinc-400">
                  Complete your onboarding to get AI-powered resume improvement suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {resumeImprovements.map((imp, i) => (
                  <div
                    key={i}
                    className="border border-[#242834] rounded-2xl overflow-hidden bg-[#090A0C]"
                  >
                    <div className="bg-[#14161D] px-4 py-2.5 border-b border-[#242834] flex items-center justify-between">
                      <span className="text-xs font-black text-white">
                        {imp.section}
                      </span>
                      {imp.atsBoost && (
                        <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 font-extrabold text-[10px] rounded-full flex items-center gap-1">
                          <span>📈</span> {imp.atsBoost}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-wide mb-1">
                          Current
                        </p>
                        <p className="text-xs text-zinc-300 bg-rose-950/40 p-3 rounded-xl border border-rose-900/40">
                          {imp.current}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide mb-1">
                          Suggested Rewrite
                        </p>
                        <p className="text-xs font-semibold text-white bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/40 leading-relaxed">
                          {imp.suggested}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-400 italic">
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
