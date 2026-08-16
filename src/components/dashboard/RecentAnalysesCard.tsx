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
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden text-black shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h2 className="text-xs font-bold text-black uppercase tracking-wider">
            Job-Specific Analyses
          </h2>
          {onNewAnalysis ? (
            <button
              onClick={onNewAnalysis}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1 border border-black"
            >
              <span>⚡ + New Analysis</span>
            </button>
          ) : (
            <Link
              href="/dashboard/analyze"
              className="text-xs font-bold text-black hover:underline"
            >
              + New Analysis
            </Link>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="py-16 text-center px-6 space-y-5">
            <div className="w-16 h-16 mx-auto bg-zinc-50 text-black border border-zinc-200 rounded-2xl flex items-center justify-center">
              <span className="text-3xl" aria-hidden="true">🎯</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-black">Ready to Scan a Target Job?</h3>
              <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                Run a targeted job analysis to compare your resume against any job description and get custom keyword fixes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onNewAnalysis ? (
                <button
                  onClick={onNewAnalysis}
                  className="px-6 py-3 bg-black text-white text-xs font-bold rounded-xl shadow-sm hover:bg-zinc-800 transition-all flex items-center gap-2 border border-black"
                >
                  <span>⚡</span> Run New Job Analysis
                </button>
              ) : (
                <Link
                  href="/dashboard/analyze"
                  className="px-6 py-3 bg-black text-white text-xs font-bold rounded-xl shadow-sm hover:bg-zinc-800 transition-all flex items-center gap-2 border border-black"
                >
                  <span>⚡</span> Run New Job Analysis
                </Link>
              )}
              <Link
                href="/dashboard/resumes"
                className="px-5 py-3 bg-white text-black text-xs font-bold border border-zinc-300 rounded-xl hover:bg-zinc-100 transition-all"
              >
                📄 Upload Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/60">
                  <th className="text-left text-[10px] font-bold text-zinc-700 uppercase tracking-wider px-6 py-3">
                    Status & Score
                  </th>
                  <th className="text-left text-[10px] font-bold text-zinc-700 uppercase tracking-wider px-6 py-3">
                    Resume
                  </th>
                  <th className="text-left text-[10px] font-bold text-zinc-700 uppercase tracking-wider px-6 py-3">
                    Job Description
                  </th>
                  <th className="text-left text-[10px] font-bold text-zinc-700 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-right text-[10px] font-bold text-zinc-700 uppercase tracking-wider px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {analyses.slice(0, 10).map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {analysis.overallScore !== null ? (
                        <TrafficLightStatus score={analysis.overallScore} size="sm" />
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-black">
                      {analysis.resume?.name || "Untitled Resume"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-700">
                      {analysis.jobDescription?.title || "Untitled Job"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/analyze/${analysis.id}`}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-black border border-zinc-300 hover:border-black transition-all inline-flex items-center gap-1 shadow-sm"
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
