"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useWorkspaceMode } from "./WorkspaceModeContext";

export default function BottomDock() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { mode } = useWorkspaceMode();

  // Dynamic Home Route determination based on authenticated persona
  const getHomeHref = () => {
    if (!session?.user) return "/";
    return mode === "recruiter" ? "/dashboard/recruiter" : "/dashboard";
  };

  const homeHref = getHomeHref();
  const isHomeActive =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/recruiter";

  const isAccountActive = pathname === "/account" || pathname.startsWith("/portfolio");

  return (
    <nav
      aria-label="Full Tile OS Navigation Dock"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="pointer-events-auto bg-[#18181B]/95 backdrop-blur-xl border border-[#27272A] rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xl transition-all">
        {/* 1. Dynamic "Home" Button */}
        <Link
          href={homeHref}
          className={`min-h-[44px] px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 cursor-pointer ${
            isHomeActive
              ? "bg-[#FAFAFA] text-[#09090B] font-black shadow-xs"
              : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#27272A]"
          }`}
          aria-label="Navigate to Home Workspace"
        >
          <span className="text-sm">🏠</span>
          <span>Home</span>
        </Link>

        {/* Divider Dot */}
        <div className="w-1 h-1 rounded-full bg-[#27272A]" />

        {/* 2. Unified "Account" Button */}
        <Link
          href={session?.user ? "/account" : "/login"}
          className={`min-h-[44px] px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 cursor-pointer ${
            isAccountActive
              ? "bg-[#FAFAFA] text-[#09090B] font-black shadow-xs"
              : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#27272A]"
          }`}
          aria-label="Navigate to Account & Profile Settings"
        >
          <span className="text-sm">👤</span>
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
