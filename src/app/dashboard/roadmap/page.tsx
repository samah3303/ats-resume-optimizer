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
    <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 text-black shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 border border-zinc-300 text-zinc-900 shadow-sm">
                <span>🗺️ Core Feature</span>
                <span>•</span>
                <span>8-Week Action Blueprint</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight text-black">
                2-Month Job Search Roadmap
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-2 max-w-xl leading-relaxed">
                Your step-by-step 8-week execution plan to fix ATS gaps, automate cold outreach, ace interviews, and secure your target job offer.
              </p>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-black hover:bg-zinc-800 text-white shadow-sm border border-black disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-2"
            >
              {isRegenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "⚡ Regenerate AI Roadmap"
              )}
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="pt-6 border-t border-zinc-200">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-zinc-600 uppercase tracking-wider">Roadmap Completion Progress</span>
              <span className="text-black font-mono font-bold">{progressPct}% Complete</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-100 overflow-hidden p-0.5 border border-zinc-200">
              <div
                className="h-full rounded-full bg-black transition-all duration-500"
                style={{ width: `${Math.max(5, progressPct)}%` }}
              />
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm">
            {statusMessage}
          </div>
        )}

        {/* Overview Card */}
        {roadmap?.strategyOverview && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700">
              AI Strategy Overview
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              {roadmap.strategyOverview}
            </p>
          </div>
        )}

        {/* Week Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {displayWeeks.map((w) => {
            const isSelected = activeWeek === w.weekNumber;
            return (
              <button
                key={w.weekNumber}
                onClick={() => setActiveWeek(w.weekNumber)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-black text-white shadow-sm font-black border border-black"
                    : "bg-zinc-100 text-zinc-800 border border-zinc-200 hover:border-black"
                }`}
              >
                <span>Week {w.weekNumber}</span>
                <span className="text-[10px] opacity-75">({w.phase})</span>
              </button>
            );
          })}
        </div>

        {/* Timeline List */}
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-xs animate-pulse font-mono">
            Loading 2-Month Action Roadmap...
          </div>
        ) : (
          <div className="space-y-4">
            {displayWeeks.map((week) => {
              const isCurrentActive = activeWeek === week.weekNumber;

              return (
                <div
                  key={week.weekNumber}
                  className={`bg-white border rounded-3xl transition-all shadow-sm ${
                    isCurrentActive
                      ? "border-black"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  {/* Week Card Header */}
                  <div
                    onClick={() => setActiveWeek(week.weekNumber)}
                    className="p-5 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-zinc-100 text-black font-black text-sm flex items-center justify-center shrink-0 border border-zinc-300 shadow-sm">
                        W{week.weekNumber}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                            Phase: {week.phase}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-black mt-0.5">
                          {week.focusTitle}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-zinc-400">
                      {isCurrentActive ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Week Tasks & Milestone (Expanded) */}
                  {isCurrentActive && (
                    <div className="px-5 pb-5 pt-2 border-t border-zinc-200 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-600 mb-2">
                          Action Checklist
                        </h4>
                        <div className="space-y-2">
                          {week.tasks.map((task, idx) => {
                            const taskKey = `w${week.weekNumber}-t${idx}`;
                            const isDone = !!completedTasks[taskKey];

                            return (
                              <label
                                key={taskKey}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                                  isDone
                                    ? "bg-zinc-100 border-zinc-300 text-zinc-400 line-through"
                                    : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:border-black"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => toggleTask(taskKey)}
                                  className="mt-0.5 rounded text-black accent-black"
                                />
                                <span className="font-medium leading-relaxed">{task}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Milestone Card */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                            Week {week.weekNumber} Milestone Target
                          </span>
                          <p className="text-xs font-black text-black mt-0.5">
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
    </div>
  );
}
