import Link from "next/link";
import { useRouter } from "next/navigation";
import ScoreGauge from "@/components/ScoreGauge";
import { Analysis } from "@/types/dashboard";

interface RecentAnalysesCardProps {
  analyses: Analysis[];
  generalAtsScore: number | null;
  onEditOnboarding?: () => void;
}

export default function RecentAnalysesCard({
  analyses,
  generalAtsScore,
  onEditOnboarding,
}: RecentAnalysesCardProps) {
  const router = useRouter();

  return (
    <>
      {/* General ATS Score (from onboarding) */}
      {generalAtsScore !== null && (
        <div className="card-premium p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <ScoreGauge score={generalAtsScore} size={100} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Resume ATS Compatibility
                </h3>
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase">
                  Primary Baseline
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                This score reflects how well your primary resume is structured for
                applicant tracking systems — based on formatting, keyword density, action
                verbs, and target country alignment.
              </p>
            </div>
          </div>

          {onEditOnboarding && (
            <button
              onClick={onEditOnboarding}
              className="px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all shrink-0 flex items-center gap-1.5 min-h-[40px] sm:min-h-0"
              title="Edit target positions, country, or primary resume and re-analyze"
            >
              <span>✏️</span> Edit Target & Regenerate
            </button>
          )}
        </div>
      )}

      {/* Analyses table */}
      <div className="card-premium overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Recent Analyses
          </h2>
          {analyses.length > 0 && (
            <Link
              href="/dashboard/analyze"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              + New Analysis
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl" aria-hidden="true">🔍</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              Upload a resume and compare it against a job description to get
              your first ATS score and tailored suggestions.
            </p>
            <Link
              href="/dashboard/analyze"
              className="btn-primary-gradient inline-block px-5 py-2.5 text-sm font-medium"
            >
              Run Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                    Score
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                    Resume
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                    Job Description
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyses.slice(0, 10).map((analysis) => (
                  <tr
                    key={analysis.id}
                    onClick={() =>
                      router.push(`/dashboard/analyze/${analysis.id}`)
                    }
                    className="border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    role="link"
                    tabIndex={0}
                    aria-label={`Analysis: ${analysis.resume?.name || "unknown"} vs ${analysis.jobDescription?.title || "unknown"}, score ${analysis.overallScore ?? "pending"}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/dashboard/analyze/${analysis.id}`);
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      {analysis.overallScore !== null ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            analysis.overallScore >= 70
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : analysis.overallScore >= 50
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          }`}
                        >
                          {analysis.overallScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {analysis.resume?.name || "Untitled Resume"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {analysis.jobDescription?.title || "Untitled Job"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
