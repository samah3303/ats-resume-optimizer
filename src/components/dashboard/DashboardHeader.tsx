import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useState } from "react";

interface DashboardHeaderProps {
  userName?: string | null;
  resumeCount: number;
  analysisCount: number;
  generalAtsScore: number | null;
  onResetOnboarding: () => void;
}

export default function DashboardHeader({
  userName,
  resumeCount,
  analysisCount,
  generalAtsScore,
  onResetOnboarding,
}: DashboardHeaderProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Welcome, {userName?.split(" ")[0] || "back"}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s your resume optimization overview & career dashboard
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Compact metrics pill */}
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 bg-slate-100 dark:bg-[#14161D] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#242834]">
            <span>
              📄 {resumeCount} Resume{resumeCount !== 1 ? "s" : ""}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>
              🔍 {analysisCount} Scan{analysisCount !== 1 ? "s" : ""}
            </span>
            {generalAtsScore !== null && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-extrabold">⭐ {generalAtsScore}% Baseline</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 border border-slate-200 dark:border-[#242834] rounded-xl transition-all"
            title="Reset onboarding & re-analyze resume"
          >
            🔄 Reset Target
          </button>
          <Link
            href="/dashboard/how-to-use"
            className="px-3.5 py-2 text-xs font-bold border border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-xl transition-all inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
          >
            <span aria-hidden="true">📖</span> How to Use
          </Link>
          <Link
            href="/dashboard/studio"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
          >
            ⚡ 1-Click Studio
          </Link>
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
