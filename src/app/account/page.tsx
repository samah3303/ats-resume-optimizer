"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspaceMode } from "@/components/WorkspaceModeContext";
import Logo from "@/components/Logo";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode, toggleMode } = useWorkspaceMode();

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const initials = (session?.user?.name || session?.user?.email || "P")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8 pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
              Account &amp; Operating System Settings
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your authenticated persona, verified credentials, and workspace state.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Tile Grid (1 col on mobile, 2 cols on md, 3 cols on lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* TILE 1: Identity & Profile */}
        <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 overflow-hidden min-h-[250px] justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                USER IDENTITY
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#09090B] border border-[#27272A] text-lg font-bold flex items-center justify-center text-[#FAFAFA]">
                {initials}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className="text-base font-bold text-[#FAFAFA] truncate">
                  {session?.user?.name || "Paniund User"}
                </h3>
                <p className="text-xs text-zinc-400 font-mono truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl text-xs space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono block">SESSION AUTH STATUS</span>
              <p className="text-zinc-300 font-medium font-mono text-[11px]">
                Secured via JWT &bull; Database Synchronized
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
            <span>Primary Profile</span>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>
        </div>

        {/* TILE 2: Active Workspace Persona */}
        <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 overflow-hidden min-h-[250px] justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                WORKSPACE PERSONA
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#27272A] text-[9px] font-bold uppercase text-[#FAFAFA]">
                {mode}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#FAFAFA]">
                {mode === "candidate" ? "👤 Candidate Suite" : "👔 Recruiter OS"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {mode === "candidate"
                  ? "Accessing ATS resume builders, Monaco coding challenges, and mock interview tools."
                  : "Accessing AI job description architects, bulk ATS screeners, and applicant pipelines."}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleMode}
              className="touch-target min-h-[44px] w-full py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>⇄</span>
              <span>Switch to {mode === "candidate" ? "Recruiter OS" : "Candidate Suite"}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
            <span>Auto-saved in local workspace state</span>
            <span className="font-mono text-zinc-500">v2.0</span>
          </div>
        </div>

        {/* TILE 3: Verified Public Portfolio */}
        <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 overflow-hidden min-h-[250px] justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                VERIFIED CREDENTIALS
              </span>
              <span className="text-xs">🏆</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#FAFAFA]">
                Public Shareable Portfolio
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your luxury candidate showcase highlighting verified ATS pass scores, coding badges, and system design grades.
              </p>
            </div>

            <Link
              href="/portfolio/alex-rivers"
              className="touch-target min-h-[44px] w-full py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <span>View Public Portfolio &rarr;</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
            <span>Certification Engine</span>
            <span className="text-emerald-400 font-bold">100% Verified</span>
          </div>
        </div>

        {/* TILE 4: Master Telemetry & Admin */}
        <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 overflow-hidden min-h-[250px] justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                ADMIN &amp; GOVERNANCE
              </span>
              <span className="text-xs">🛡️</span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#FAFAFA]">
                Telemetry Control Room
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Executive platform metrics, real-time AI spending ledgers, multi-tenant cluster status, and system moderation.
              </p>
            </div>

            <Link
              href="/admin"
              className="touch-target min-h-[44px] w-full py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
            >
              <span>Launch Admin OS &rarr;</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
            <span>Cluster Health</span>
            <span className="text-emerald-400 font-mono font-bold">Online</span>
          </div>
        </div>

        {/* TILE 5: Security & Session Actions */}
        <div className="flex flex-col bg-[#18181B] border border-[#27272A] rounded-2xl p-4 sm:p-6 overflow-hidden min-h-[250px] justify-between md:col-span-2 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                SECURITY &amp; SESSION
              </span>
              <span className="text-xs">🔒</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#FAFAFA]">Data Privacy &amp; Governance</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your resume data, coding attempts, and interview telemetry are encrypted at rest with AES-256 and never sold to third-party data brokers.
                </p>
              </div>

              <div className="space-y-2 flex flex-col justify-center">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="touch-target min-h-[44px] w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>🚪</span>
                  <span>Sign Out of Paniund</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>Paniund Talent Operating System</span>
            <span>&copy; {new Date().getFullYear()} paniund.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
