"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rRes, jRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/jds"),
        ]);
        if (rRes.ok) setResumeCount((await rRes.json()).resumes?.length || 0);
        if (jRes.ok) setJobCount((await jRes.json()).jds?.length || 0);
      } catch {}
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = (session?.user?.name || session?.user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white text-sm font-bold flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2 animate-in fade-in">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-slate-900 text-sm">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {session?.user?.email}
            </p>
          </div>

          {/* Stats */}
          <div className="px-4 py-2 border-b border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-indigo-600">{resumeCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Resumes</p>
            </div>
            <div>
              <p className="text-lg font-bold text-indigo-600">{jobCount}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Jobs</p>
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); router.push("/"); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              ✏️ Edit Onboarding
            </button>
            <button
              onClick={() => { setOpen(false); router.push("/dashboard"); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              🏠 Dashboard
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1 pb-1">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
