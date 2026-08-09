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
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Welcome, {userName?.split(" ")[0] || "back"}!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here&apos;s your resume optimization overview & career dashboard
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Compact metrics pill */}
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 bg-[#14161D] rounded-2xl text-xs font-bold text-zinc-300 border border-[#242834]">
            <span>
              📄 {resumeCount} Resume{resumeCount !== 1 ? "s" : ""}
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              🔍 {analysisCount} Scan{analysisCount !== 1 ? "s" : ""}
            </span>
            {generalAtsScore !== null && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-black">⭐ {generalAtsScore}% Baseline</span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2.5 text-xs font-bold text-zinc-300 hover:text-white bg-[#14161D] border border-[#242834] rounded-2xl transition-all"
            title="Reset onboarding & re-analyze resume"
          >
            🔄 Reset Target
          </button>
          <Link
            href="/dashboard/how-to-use"
            className="px-4 py-2.5 text-xs font-bold border border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-2xl transition-all inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
          >
            <span aria-hidden="true">📖</span> How to Use
          </Link>
          <Link
            href="/dashboard/studio"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2.5 text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
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
