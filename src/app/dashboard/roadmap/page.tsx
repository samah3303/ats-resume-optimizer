"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WeekTask {
  id: string;
  weekNumber: number;
  phase: string;
  focusTitle: string;
  tasks: string[];
  milestone: string;
}

interface Roadmap {
  id: string;
  strategyOverview: string | null;
  weeks: WeekTask[];
  generatedAt: string;
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roadmap");
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap || null);
      }
    } catch (err) {
      console.error("Failed to load roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/roadmap", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate roadmap.");
      setRoadmap(data.roadmap);
      setStatusMessage("🎉 Fresh 2-Month AI Action Roadmap generated!");
    } catch (err) {
      setStatusMessage(`❌ ${(err as Error).message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  // Default fallback 8-week template if no onboarding completed yet
  const defaultWeeks: WeekTask[] = [
    {
      id: "w1",
      weekNumber: 1,
      phase: "Foundation",
      focusTitle: "Resume ATS Audit & Formatting Fixes",
      tasks: [
        "Audit resume against top 3 target job descriptions in Studio",
        "Eliminate formatting hazards (tables, columns, missing contact info)",
        "Optimize Core Skills section with exact keyword matches",
      ],
      milestone: "100% Scannable ATS Resume Baseline Created",
    },
    {
      id: "w2",
      weekNumber: 2,
      phase: "Foundation",
      focusTitle: "STAR Metric Bullet Point Overhaul",
      tasks: [
        "Rewrite top 5 bullet points using STAR method (Action + Metric + Outcome)",
        "Incorporate missing hard technical skills flagged by ATS Audit",
        "Generate scannable ATS PDF in Builder",
      ],
      milestone: "Quantified Accomplishments Built",
    },
    {
      id: "w3",
      weekNumber: 3,
      phase: "High Velocity",
      focusTitle: "Target List & LinkedIn Branding",
      tasks: [
        "Build target company list of 20 companies in your industry",
        "Optimize LinkedIn headline, summary, and experience section",
        "Set up job alerts on LinkedIn, Glassdoor, and Indeed",
      ],
      milestone: "LinkedIn Profile Optimized & Target List Ready",
    },
    {
      id: "w4",
      weekNumber: 4,
      phase: "High Velocity",
      focusTitle: "Cold Outreach & Recruiter Pipeline",
      tasks: [
        "Generate 10 LinkedIn connection notes using Outreach Studio",
        "Send 5 cold emails to hiring managers with custom cover letters",
        "Log all outreach activities in Kanban Tracker",
      ],
      milestone: "First 15 Cold Outreaches Dispatched",
    },
    {
      id: "w5",
      weekNumber: 5,
      phase: "High Velocity",
      focusTitle: "Active Application Sprint",
      tasks: [
        "Apply to 10 tailored job descriptions using Studio ATS customizer",
        "Follow up on Week 4 outreaches with polite bump emails",
        "Maintain Daily Search Sprint streak",
      ],
      milestone: "10 Custom Applications Submitted",
    },
    {
      id: "w6",
      weekNumber: 6,
      phase: "Conversion",
      focusTitle: "Behavioral & Technical Mock Prep",
      tasks: [
        "Predict top 10 interview questions for target role in Prep Studio",
        "Draft STAR responses for common behavioral prompts",
        "Practice technical skill gap answers",
      ],
      milestone: "Interview Readiness Achieved",
    },
    {
      id: "w7",
      weekNumber: 7,
      phase: "Conversion",
      focusTitle: "First Round Interview Execution",
      tasks: [
        "Complete recruiter screeners and hiring manager calls",
        "Send post-interview thank-you notes within 24 hours",
        "Refine answers based on real interview feedback",
      ],
      milestone: "Second-Round Technical Interviews Booked",
    },
    {
      id: "w8",
      weekNumber: 8,
      phase: "Conversion",
      focusTitle: "Final Round & Offer Negotiation",
      tasks: [
        "Complete final presentation or panel interview",
        "Benchmark market compensation using industry data",
        "Negotiate salary, equity, and start date",
      ],
      milestone: "🎯 Job Offer Secured!",
    },
  ];

  const displayWeeks = roadmap?.weeks && roadmap.weeks.length > 0 ? roadmap.weeks : defaultWeeks;

  // Calculate overall progress
  const totalTasks = displayWeeks.reduce((acc, w) => acc + w.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* Mobile-First Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
              <span>🗺️ Core Feature</span>
              <span>•</span>
              <span>8-Week Action Blueprint</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
              2-Month Job Search Roadmap
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xl">
              Your step-by-step 8-week execution plan to fix ATS gaps, automate cold outreach, ace interviews, and secure your target job offer.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            {isRegenerating ? "Generating..." : "⚡ Regenerate AI Roadmap"}
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6 pt-6 border-t border-indigo-800/60">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-indigo-200">Roadmap Completion Progress</span>
            <span className="text-white">{progressPct}% Complete</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-indigo-500/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.max(5, progressPct)}%` }}
            />
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl text-xs font-semibold bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
          {statusMessage}
        </div>
      )}

      {/* Overview Card */}
      {roadmap?.strategyOverview && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            AI Strategy Overview
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {roadmap.strategyOverview}
          </p>
        </div>
      )}

      {/* Week Selector Chips (Mobile Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {displayWeeks.map((w) => {
          const isSelected = activeWeek === w.weekNumber;
          return (
            <button
              key={w.weekNumber}
              onClick={() => setActiveWeek(w.weekNumber)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              }`}
            >
              <span>Week {w.weekNumber}</span>
              <span className="text-[10px] opacity-80">({w.phase})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline List (Mobile Optimized) */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
          Loading 2-Month Action Roadmap...
        </div>
      ) : (
        <div className="space-y-4">
          {displayWeeks.map((week) => {
            const isCurrentActive = activeWeek === week.weekNumber;

            return (
              <div
                key={week.weekNumber}
                className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all ${
                  isCurrentActive
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "border-slate-200 dark:border-slate-800 opacity-90"
                }`}
              >
                {/* Week Card Header */}
                <div
                  onClick={() => setActiveWeek(week.weekNumber)}
                  className="p-5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800/60">
                      W{week.weekNumber}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Phase: {week.phase}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {week.focusTitle}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {isCurrentActive ? "▲" : "▼"}
                  </span>
                </div>

                {/* Week Tasks & Milestone (Expanded) */}
                {isCurrentActive && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Action Checklist
                      </h4>
                      <div className="space-y-2">
                        {week.tasks.map((task, idx) => {
                          const taskKey = `w${week.weekNumber}-t${idx}`;
                          const isDone = !!completedTasks[taskKey];

                          return (
                            <label
                              key={taskKey}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isDone
                                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 line-through"
                                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleTask(taskKey)}
                                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="font-medium leading-relaxed">{task}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Milestone Card */}
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Week {week.weekNumber} Milestone Target
                        </span>
                        <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mt-0.5">
                          🎯 {week.milestone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
