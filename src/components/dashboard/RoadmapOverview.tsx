"use client";

import { useState } from "react";
import Link from "next/link";
import { Roadmap, WeekTask } from "@/types/dashboard";

interface RoadmapOverviewProps {
  roadmap: Roadmap | null;
  roadmapLoading: boolean;
  onRegenRoadmap: () => void;
  onResetOnboarding: () => void;
}

export default function RoadmapOverview({
  roadmap,
  roadmapLoading,
  onRegenRoadmap,
  onResetOnboarding,
}: RoadmapOverviewProps) {
  const [weeksData, setWeeksData] = useState<WeekTask[]>(roadmap?.weeks || []);

  if (!roadmap) {
    return (
      <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 mb-3">
          Complete your onboarding to get a personalized 8-week career roadmap.
        </p>
        <Link
          href="/"
          className="btn-primary-gradient inline-block px-4 py-2 text-sm font-medium"
        >
          Complete Your Onboarding
        </Link>
      </div>
    );
  }

  // Calculate completion progress
  let totalTasks = 0;
  let completedCount = 0;

  weeksData.forEach((w) => {
    totalTasks += w.tasks.length;
    const completedArr = w.completedTasks || [];
    w.tasks.forEach((_, idx) => {
      if (completedArr[idx]) completedCount++;
    });
  });

  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const genCount = roadmap.generationCount || 1;

  const handleToggleTask = async (weekTaskId: string, taskIndex: number, currentCompleted: boolean) => {
    const updatedWeeks = weeksData.map((w) => {
      if (w.id !== weekTaskId) return w;
      const newCompleted = [...(w.completedTasks || new Array(w.tasks.length).fill(false))];
      newCompleted[taskIndex] = !currentCompleted;
      return { ...w, completedTasks: newCompleted };
    });

    setWeeksData(updatedWeeks);

    try {
      await fetch("/api/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekTaskId,
          taskIndex,
          completed: !currentCompleted,
        }),
      });
    } catch (err) {
      console.error("Failed to save task state:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Roadmap Strategy Overview & Progress Header */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              8-Week Execution Tracker
            </span>
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full uppercase">
              {genCount === 1 ? "Iteration 1 (Initial Setup)" : `Iteration ${genCount} (Post-Fix Roadmap)`}
            </span>
          </div>

          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {completedCount} of {totalTasks} Tasks Completed ({progressPct}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {roadmap.strategyOverview && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
            {roadmap.strategyOverview}
          </p>
        )}
      </div>

      {/* Week-by-Week Roadmap Cards */}
      <div className="space-y-0 pt-2">
        {weeksData.map((week, i) => {
          const phaseBorder =
            week.phase === "Foundation"
              ? "border-l-blue-500 dark:border-l-blue-400"
              : week.phase === "High Velocity"
              ? "border-l-amber-500 dark:border-l-amber-400"
              : "border-l-green-500 dark:border-l-green-400";
          const phaseBg =
            week.phase === "Foundation"
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : week.phase === "High Velocity"
              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300";

          return (
            <div
              key={week.id}
              className={`relative pl-6 pb-6 border-l-2 ${phaseBorder} ${
                i === weeksData.length - 1 ? "border-l-transparent" : ""
              } last:pb-0`}
            >
              <div
                className={`absolute left-0 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                  week.phase === "Foundation"
                    ? "bg-blue-500"
                    : week.phase === "High Velocity"
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
              />
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Week {week.weekNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${phaseBg}`}
                  >
                    {week.phase}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  {week.focusTitle}
                </h4>
                <ul className="space-y-2 mb-3">
                  {week.tasks.map((task, ti) => {
                    const isDone = Boolean(week.completedTasks?.[ti]);
                    return (
                      <li
                        key={ti}
                        onClick={() => handleToggleTask(week.id, ti, isDone)}
                        className={`flex items-start gap-2.5 text-sm p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDone
                            ? "bg-emerald-50/60 dark:bg-emerald-900/20 text-slate-400 dark:text-slate-500 line-through"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}} // handled by parent li click
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                        />
                        <span className="leading-snug">{task}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <span aria-hidden="true">🏁</span>
                  <span className="font-semibold">Milestone:</span>
                  <span>{week.milestone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Generated{" "}
          {new Date(roadmap.generatedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onRegenRoadmap}
            disabled={roadmapLoading}
            className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {roadmapLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "🔄 Regenerate Roadmap"
            )}
          </button>
          <button
            onClick={onResetOnboarding}
            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
