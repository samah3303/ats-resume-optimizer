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
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="shrink-0">
              <ScoreGauge score={generalAtsScore} size={100} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white mb-1">
                  Resume ATS Compatibility
                </h3>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black rounded-full uppercase">
                  Primary Baseline
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                This score reflects how well your primary resume is structured for
                applicant tracking systems — based on formatting, keyword density, action
                verbs, and target country alignment.
              </p>
            </div>
          </div>

          {onEditOnboarding && (
            <button
              onClick={onEditOnboarding}
              className="px-4 py-2.5 text-xs font-black text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all shrink-0 flex items-center gap-1.5 min-h-[40px] sm:min-h-0"
              title="Edit target positions, country, or primary resume and re-analyze"
            >
              <span>✏️</span> Edit Target & Regenerate
            </button>
          )}
        </div>
      )}

      {/* Analyses table */}
      <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] overflow-hidden text-white shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#242834]">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Recent Analyses
          </h2>
          {analyses.length > 0 && (
            <Link
              href="/dashboard/analyze"
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              + New Analysis
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="py-16 text-center px-6 space-y-3">
            <div className="w-16 h-16 mx-auto bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl" aria-hidden="true">🔍</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Upload a resume and compare it against a job description to get
              your first ATS score and tailored suggestions.
            </p>
            <Link
              href="/dashboard/analyze"
              className="px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl inline-block"
            >
              Run Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#242834]">
                  <th className="text-left text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
                    Score
                  </th>
                  <th className="text-left text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
                    Resume
                  </th>
                  <th className="text-left text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
                    Job Description
                  </th>
                  <th className="text-left text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
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
                    className="border-b border-[#242834] hover:bg-[#1C1F2B]/60 transition-colors cursor-pointer"
                    role="link"
                    tabIndex={0}
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black ${
                            analysis.overallScore >= 70
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : analysis.overallScore >= 50
                              ? "bg-amber-950 text-amber-300 border border-amber-800"
                              : "bg-rose-950 text-rose-300 border border-rose-800"
                          }`}
                        >
                          {analysis.overallScore}%
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white">
                      {analysis.resume?.name || "Untitled Resume"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-300">
                      {analysis.jobDescription?.title || "Untitled Job"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
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
