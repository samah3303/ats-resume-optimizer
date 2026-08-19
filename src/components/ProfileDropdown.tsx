"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useWorkspaceMode } from "./WorkspaceModeContext";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const { mode, setMode } = useWorkspaceMode();
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

  useEffect(() => {
    if (open) {
      firstMenuItemRef.current?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [open]);

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
        aria-label="Profile menu"
        className="w-9 h-9 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shadow-sm hover:bg-zinc-800 transition-colors border border-black"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 py-2 animate-in fade-in"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center justify-between">
              <p className="font-bold text-zinc-900 text-sm">
                {session?.user?.name || "User"}
              </p>
              <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[9px] font-black uppercase text-black">
                {mode === "candidate" ? "Candidate" : "Recruiter"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {session?.user?.email}
            </p>
          </div>

          {/* Persona Switcher Block */}
          <div className="p-2 border-b border-zinc-100 bg-zinc-50">
            <div className="grid grid-cols-2 gap-1 p-1 bg-white border border-zinc-200 rounded-xl text-center">
              <button
                type="button"
                onClick={() => {
                  setMode("candidate");
                  setOpen(false);
                }}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === "candidate"
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                👤 Candidate
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("recruiter");
                  setOpen(false);
                }}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  mode === "recruiter"
                    ? "bg-black text-white shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                👔 Recruiter
              </button>
            </div>
          </div>

          {/* Stats */}
          {mode === "candidate" && (
            <div className="px-4 py-2.5 border-b border-zinc-100">
              {statsError ? (
                <p className="text-xs text-rose-500 text-center">{statsError}</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-zinc-50 rounded-xl py-1.5 border border-zinc-100">
                    <p className="text-base font-black text-black">{resumeCount}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Resumes</p>
                  </div>
                  <div className="bg-zinc-50 rounded-xl py-1.5 border border-zinc-100">
                    <p className="text-base font-black text-black">{jobCount}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Jobs</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Persona-Filtered Menu Actions */}
          <div className="py-1">
            {mode === "candidate" ? (
              <>
                <button
                  ref={firstMenuItemRef}
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/builder"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">📄</span> ATS Resume Studio
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/challenges"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">💻</span> Coding Sandbox
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/mock-interview"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">🎙️</span> Voice Mock Interview
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/whiteboard"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">📐</span> System Design Arena
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/offers"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">💰</span> Salary War Room
                </button>
              </>
            ) : (
              <>
                <button
                  ref={firstMenuItemRef}
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/recruiter"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">👔</span> Recruiter Dashboard
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/recruiter/pipeline/engineering-lead-01"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">📋</span> 8-Stage Candidate Pipeline
                </button>
                <button
                  role="menuitem"
                  onClick={() => { setOpen(false); router.push("/dashboard/interview-rooms"); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
                >
                  <span aria-hidden="true">📹</span> WebRTC Interview Rooms
                </button>
              </>
            )}

            <button
              role="menuitem"
              onClick={() => { setOpen(false); toggle(); }}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">{dark ? "☀️" : "🌙"}</span>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className="border-t border-zinc-100 pt-1 pb-1">
            <button
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
            >
              <span aria-hidden="true">🚪</span> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
