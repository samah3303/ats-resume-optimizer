"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "./ThemeProvider";
import { useWorkspaceMode } from "./WorkspaceModeContext";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const { mode, toggleMode } = useWorkspaceMode();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open]
  );

  const initials = (session?.user?.name || session?.user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={toggleButtonRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
        className="w-8 h-8 rounded-full bg-[#FAFAFA] text-[#09090B] text-xs font-black flex items-center justify-center transition-colors border border-[#FAFAFA] cursor-pointer active:scale-95 hover:bg-zinc-200"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-12 w-60 bg-[#18181B] rounded-2xl border border-[#27272A] z-50 p-2 animate-in fade-in slide-in-from-bottom-2 space-y-2 text-[#FAFAFA]"
        >
          {/* User info */}
          <div className="px-3 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#FAFAFA] text-xs truncate max-w-[120px]">
                {session?.user?.name || "User"}
              </p>
              <span className="px-1.5 py-0.2 rounded-md bg-[#27272A] border border-[#3F3F46] text-[#FAFAFA] text-[9px] font-black uppercase">
                {mode === "candidate" ? "Candidate" : "Recruiter"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
              {session?.user?.email}
            </p>
          </div>

          <div className="border-t border-[#27272A] pt-1">
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
