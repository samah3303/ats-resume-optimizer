"use client";

import { useState, useEffect } from "react";

export default function DailySprintWidget() {
  const [appsCount, setAppsCount] = useState(0);
  const [outreachCount, setOutreachCount] = useState(0);
  const [prepDone, setPrepDone] = useState(false);
  const [streak, setStreak] = useState(1);

  // Targets
  const TARGET_APPS = 3;
  const TARGET_OUTREACH = 2;

  useEffect(() => {
    const saved = localStorage.getItem("resumatch_daily_sprint");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        if (data.date === today) {
          setAppsCount(data.appsCount || 0);
          setOutreachCount(data.outreachCount || 0);
          setPrepDone(data.prepDone || false);
          setStreak(data.streak || 1);
        } else {
          // New day
          setStreak((prev) => (data.completed ? data.streak + 1 : 1));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveState = (newApps: number, newOutreach: number, newPrep: boolean) => {
    const today = new Date().toDateString();
    const isCompleted = newApps >= TARGET_APPS && newOutreach >= TARGET_OUTREACH && newPrep;
    localStorage.setItem(
      "resumatch_daily_sprint",
      JSON.stringify({
        date: today,
        appsCount: newApps,
        outreachCount: newOutreach,
        prepDone: newPrep,
        streak,
        completed: isCompleted,
      })
    );
  };

  const incrementApps = () => {
    const updated = appsCount + 1;
    setAppsCount(updated);
    saveState(updated, outreachCount, prepDone);
  };

  const incrementOutreach = () => {
    const updated = outreachCount + 1;
    setOutreachCount(updated);
    saveState(appsCount, updated, prepDone);
  };

  const togglePrep = () => {
    const updated = !prepDone;
    setPrepDone(updated);
    saveState(appsCount, outreachCount, updated);
  };

  const isDayCompleted = appsCount >= TARGET_APPS && outreachCount >= TARGET_OUTREACH && prepDone;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔥</span>
          <div>
            <h3 className="text-base font-bold">Daily Job Search Sprint</h3>
            <p className="text-xs text-indigo-200">Consistency beats luck. Hit your daily target!</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-bold text-amber-300 flex items-center gap-1">
          <span>⚡ {streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Task 1 */}
        <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-100">Applications Sent</span>
            <span className="font-bold text-white">{appsCount} / {TARGET_APPS}</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (appsCount / TARGET_APPS) * 100)}%` }}
            />
          </div>
          <button
            onClick={incrementApps}
            className="w-full py-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
          >
            + Log Application
          </button>
        </div>

        {/* Task 2 */}
        <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-100">Cold Outreaches</span>
            <span className="font-bold text-white">{outreachCount} / {TARGET_OUTREACH}</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (outreachCount / TARGET_OUTREACH) * 100)}%` }}
            />
          </div>
          <button
            onClick={incrementOutreach}
            className="w-full py-1 text-[11px] font-bold bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
          >
            + Log Cold Outreach
          </button>
        </div>

        {/* Task 3 */}
        <div className="p-3 bg-white/10 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-100">15 Min Interview Prep</span>
            <span className="font-bold text-white">{prepDone ? "Done!" : "0/1"}</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: prepDone ? "100%" : "0%" }}
            />
          </div>
          <button
            onClick={togglePrep}
            className={`w-full py-1 text-[11px] font-bold rounded-lg transition-colors ${
              prepDone ? "bg-emerald-500/80 text-white" : "bg-white/15 hover:bg-white/25"
            }`}
          >
            {prepDone ? "✓ Complete" : "Mark Prep Complete"}
          </button>
        </div>
      </div>

      {isDayCompleted && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-center text-xs font-bold text-emerald-200">
          🎉 Fantastic job! You hit today&apos;s job search sprint targets. Keep momentum going tomorrow!
        </div>
      )}
    </div>
  );
}
