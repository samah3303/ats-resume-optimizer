"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rRes, jRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/jds"),
        ]);
        if (rRes.ok) setResumeCount((await rRes.json()).resumes?.length || 0);
        if (jRes.ok) setJobCount((await jRes.json()).jds?.length || 0);
        setStatsError(null);
      } catch {
        setStatsError("Could not load stats");
      }
    };
    fetchStats();
  }, []);

  // Focus first menu item when open, return focus to toggle when closed
  useEffect(() => {
    if (open) {
      firstMenuItemRef.current?.focus();
    } else {
      // Return focus to toggle when closed programmatically (e.g. Escape)
      toggleButtonRef.current?.focus();
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Escape key handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        // Focus is returned by the useEffect above
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
        aria-label="Profile menu"
        className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white text-sm font-bold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-2 animate-in fade-in"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {session?.user?.email}
            </p>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
            {statsError ? (
              <p className="text-xs text-red-500 text-center">{statsError}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{resumeCount}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resumes</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{jobCount}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jobs</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              ref={firstMenuItemRef}
              role="menuitem"
              onClick={() => { setOpen(false); router.push("/"); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span aria-hidden="true">✏️ </span>Edit Onboarding
            </button>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); toggle(); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span aria-hidden="true">{dark ? "☀️ " : "🌙 "}</span>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              role="menuitem"
              onClick={() => { setOpen(false); router.push("/dashboard"); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span aria-hidden="true">🏠 </span>Dashboard
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-1 pb-1">
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
