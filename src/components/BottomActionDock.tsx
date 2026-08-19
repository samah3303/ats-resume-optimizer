"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceMode } from "./WorkspaceModeContext";
import ProfileDropdown from "./ProfileDropdown";

export default function BottomActionDock() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useWorkspaceMode();

  if (!session?.user) {
    return null;
  }

  const triggerSearch = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  };

  const isHome = pathname === "/dashboard" || pathname === "/dashboard/recruiter";
  const isTracker = pathname === "/dashboard/tracker" || pathname.includes("/pipeline/");
  const isStudio = pathname === "/dashboard/builder";

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-zinc-300 shadow-2xl rounded-full px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2.5 transition-all">
        {/* 1. Hub Tile Navigation */}
        <Link
          href={mode === "candidate" ? "/dashboard" : "/dashboard/recruiter"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isHome
              ? "bg-black text-white shadow-xs font-black"
              : "text-zinc-600 hover:text-black hover:bg-zinc-100"
          }`}
          aria-label="Workspace Tile Hub"
        >
          <span className="text-sm">🏠</span>
          <span className="hidden sm:inline">Tile Hub</span>
        </Link>

        {/* 2. Workspace Persona Switcher */}
        <button
          type="button"
          onClick={toggleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-all border border-zinc-200 cursor-pointer"
          aria-label="Switch workspace persona"
        >
          <span className="text-sm">⇄</span>
          <span className="text-[11px] font-black uppercase text-black">
            {mode === "candidate" ? "👤 Candidate" : "👔 Recruiter"}
          </span>
        </button>

        {/* 3. Global ⌘K Omni-Search */}
        <button
          type="button"
          onClick={triggerSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-all cursor-pointer"
          aria-label="Open search palette"
        >
          <span className="text-sm">🔍</span>
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-zinc-100 border border-zinc-300 rounded text-[9px] font-mono text-zinc-600">
            ⌘K
          </kbd>
        </button>

        {/* 4. Tracker / Pipeline */}
        <Link
          href={mode === "candidate" ? "/dashboard/tracker" : "/dashboard/recruiter/pipeline/engineering-lead-01"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isTracker
              ? "bg-black text-white shadow-xs font-black"
              : "text-zinc-600 hover:text-black hover:bg-zinc-100"
          }`}
          aria-label="Application Tracker"
        >
          <span className="text-sm">📋</span>
          <span className="hidden sm:inline">{mode === "candidate" ? "Tracker" : "Pipelines"}</span>
        </Link>

        {/* 5. Account / Profile Avatar Icon Mounted Exclusively in Bottom Dock */}
        <div className="pl-1 border-l border-zinc-200 flex items-center">
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}
