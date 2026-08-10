import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import TrafficLightStatus from "@/components/TrafficLightStatus";
import { useState } from "react";

interface DashboardHeaderProps {
  userName?: string | null;
  resumeCount: number;
  analysisCount: number;
  generalAtsScore: number | null;
  onResetOnboarding: () => void;
  onNewAnalysis?: () => void;
}

export default function DashboardHeader({
  userName,
  resumeCount,
  analysisCount,
  generalAtsScore,
  onResetOnboarding,
  onNewAnalysis,
}: DashboardHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Job Search Dashboard
              </span>
              {generalAtsScore !== null && (
                <TrafficLightStatus score={generalAtsScore} size="sm" />
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, {userName?.split(" ")[0] || "Candidate"}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              {generalAtsScore !== null
                ? `Your baseline resume score is ${generalAtsScore}%. Ready to apply for a job? Run a targeted job analysis or follow your 2-Month Plan.`
                : "Upload your resume to get your baseline ATS score and start applying."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onNewAnalysis ? (
              <button
                onClick={onNewAnalysis}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>⚡ + Run New Analysis</span>
              </button>
            ) : (
              <Link
                href="/dashboard/analyze"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>⚡ + Run New Analysis</span>
              </Link>
            )}

            <Link
              href="/dashboard/roadmap"
              className="px-5 py-3.5 text-xs font-black border border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>🗺️ View 2-Month Plan</span>
            </Link>
          </div>
        </div>

        {/* Bottom meta row */}
        <div className="pt-4 border-t border-[#242834] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <span>📄 <strong>{resumeCount}</strong> Resume{resumeCount !== 1 ? "s" : ""}</span>
            <span>•</span>
            <span>🔍 <strong>{analysisCount}</strong> Job Scan{analysisCount !== 1 ? "s" : ""}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/how-to-use"
              className="text-zinc-400 hover:text-amber-300 text-xs font-bold transition-colors"
            >
              📖 System Guide
            </Link>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-zinc-400 hover:text-rose-400 text-xs font-bold transition-colors"
            >
              🔄 Reset Target
            </button>
          </div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Onboarding Data?"
        message="This will clear your onboarding preferences, resume baseline analysis, and career roadmap. You will be redirected to the onboarding wizard. Your saved resumes and past JD analyses will remain intact."
        confirmLabel="Yes, Reset Onboarding"
        variant="danger"
        onConfirm={() => {
          setShowResetConfirm(false);
          onResetOnboarding();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}
