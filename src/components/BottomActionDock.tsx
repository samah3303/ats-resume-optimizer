"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

export default function BottomActionDock() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) {
    return null;
  }

  // Hide dock on enterprise routes
  if (pathname.startsWith("/enterprise")) {
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

  const isHome = pathname === "/dashboard";
  const isTracker = pathname === "/dashboard/tracker";

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto bg-[#18181B]/95 backdrop-blur-xl border border-[#27272A] rounded-full px-3.5 py-1.5 flex items-center gap-1.5 sm:gap-2.5 transition-all">
        {/* 1. Hub Tile Navigation */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isHome
              ? "bg-[#FAFAFA] text-[#09090B] font-black"
              : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#27272A]"
          }`}
          aria-label="Campaign Hub"
        >
          <span className="text-sm">🗺️</span>
          <span className="hidden sm:inline">Campaign Hub</span>
        </Link>

        {/* 2. Tracker / Pipeline */}
        <Link
          href="/dashboard/tracker"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isTracker
              ? "bg-[#FAFAFA] text-[#09090B] font-black"
              : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#27272A]"
          }`}
          aria-label="Application Tracker"
        >
          <span className="text-sm">📋</span>
          <span className="hidden sm:inline">Tracker</span>
        </Link>

        {/* 3. Global ⌘K Omni-Search */}
        <button
          type="button"
          onClick={triggerSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#27272A] transition-all cursor-pointer"
          aria-label="Open search palette"
        >
          <span className="text-sm">🔍</span>
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-[#27272A] border border-[#3F3F46] rounded text-[9px] font-mono text-zinc-300">
            ⌘K
          </kbd>
        </button>

        {/* 4. Account / Profile Avatar Icon Mounted Exclusively in Bottom Dock */}
        <div className="pl-1 border-l border-[#27272A] flex items-center">
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}
