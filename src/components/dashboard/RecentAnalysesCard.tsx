import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScoreGauge from "@/components/ScoreGauge";
import TrafficLightStatus from "@/components/TrafficLightStatus";
import FixMyResumeWizardModal from "@/components/FixMyResumeWizardModal";
import { Analysis } from "@/types/dashboard";

interface RecentAnalysesCardProps {
  analyses: Analysis[];
  generalAtsScore: number | null;
  onEditOnboarding?: () => void;
  onNewAnalysis?: () => void;
}

export default function RecentAnalysesCard({
  analyses,
  generalAtsScore,
  onEditOnboarding,
  onNewAnalysis,
}: RecentAnalysesCardProps) {
  const router = useRouter();
  const [showFixWizard, setShowFixWizard] = useState(false);

  return (
    <>
      {/* Analyses table */}
      <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] overflow-hidden text-white shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-[#242834]">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Job-Specific Analyses
          </h2>
          {onNewAnalysis ? (
            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md flex items-center gap-1"
            >
              <span>⚡ + New Analysis</span>
            </button>
          ) : (
            <Link
              href="/dashboard/analyze"
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              + New Analysis
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="py-16 text-center px-6 space-y-5">
            <div className="w-20 h-20 mx-auto bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-3xl flex items-center justify-center">
              <span className="text-4xl" aria-hidden="true">🎯</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-white">Ready to Scan a Target Job?</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Run a targeted job analysis to compare your resume against any job description and get custom keyword fixes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNewAnalysis ? (
                <button
                  onClick={onNewAnalysis}
                  className="px-6 py-3 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center gap-2"
                >
                  <span>⚡</span> Run New Job Analysis
                </button>
              ) : (
                <Link
                  href="/dashboard/analyze"
                  className="px-6 py-3 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all flex items-center gap-2"
                >
                  <span>⚡</span> Run New Job Analysis
                </Link>
              )}
              <Link
                href="/dashboard/resumes"
                className="px-5 py-3 bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30 rounded-2xl hover:bg-amber-500/20 transition-all"
              >
                📄 Upload Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#242834]">
                  <th className="text-left text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
                    Status & Score
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
                  <th className="text-right text-[10px] font-black text-amber-300 uppercase tracking-wider px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyses.slice(0, 10).map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="border-b border-[#242834] hover:bg-[#1C1F2B]/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {analysis.overallScore !== null ? (
                        <TrafficLightStatus score={analysis.overallScore} size="sm" />
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
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/analyze/${analysis.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>View</span>
                        <span>→</span>
                      </Link>
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
