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
        className="w-8 h-8 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shadow-sm hover:bg-zinc-800 transition-colors border border-black cursor-pointer active:scale-95"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-12 w-60 bg-white rounded-2xl border border-zinc-300 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-bottom-2 space-y-2"
        >
          {/* User info */}
          <div className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-bold text-zinc-900 text-xs truncate max-w-[120px]">
                {session?.user?.name || "User"}
              </p>
              <span className="px-1.5 py-0.2 rounded-md bg-black text-white text-[9px] font-black uppercase">
                {mode === "candidate" ? "Candidate" : "Recruiter"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5">
              {session?.user?.email}
            </p>
          </div>

          {/* Quick Actions (Theme & Logout Only - All features moved to Tile OS) */}
          <div className="space-y-1">
            <button
              role="menuitem"
              onClick={() => {
                toggleMode();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>⇄ Switch Workspace</span>
              <span className="text-[10px] text-zinc-400 font-mono uppercase">
                {mode === "candidate" ? "To Recruiter" : "To Candidate"}
              </span>
            </button>

            <button
              role="menuitem"
              onClick={() => {
                toggle();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
            >
              <span>{dark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {dark ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          <div className="border-t border-zinc-100 pt-1">
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
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
