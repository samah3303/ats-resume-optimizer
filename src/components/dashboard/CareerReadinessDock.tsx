"use client";

import { useState } from "react";
import Link from "next/link";

interface StepItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  ctaText: string;
  completed: boolean;
  points: number;
}

export function CareerReadinessDock() {
  const [steps, setSteps] = useState<StepItem[]>([
    {
      id: "step-1",
      title: "Optimize ATS Resume",
      subtitle: "Build or scan your primary resume with 6 ATS templates & STAR rewriters.",
      icon: "📄",
      href: "/dashboard/builder",
      ctaText: "Launch Studio",
      completed: true,
      points: 35,
    },
    {
      id: "step-2",
      title: "Complete Spoken Voice Mock",
      subtitle: "Practice real-time spoken Q&A with dynamic waveforms & instant STAR scorecards.",
      icon: "🎙️",
      href: "/dashboard/mock-interview",
      ctaText: "Start Practice",
      completed: false,
      points: 35,
    },
    {
      id: "step-3",
      title: "Activate Autonomous Swarm",
      subtitle: "Deploy Hunter Agent to scan 140k+ listings and draft tailored applications 24/7.",
      icon: "🤖",
      href: "/dashboard/agents",
      ctaText: "Deploy Swarm",
      completed: false,
      points: 30,
    },
  ]);

  const [isDismissed, setIsDismissed] = useState(false);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round(
    (steps.filter((s) => s.completed).reduce((acc, s) => acc + s.points, 0))
  );

  if (isDismissed) return null;

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
              CAREER READINESS PATHWAY
            </span>
            <span className="text-xs font-mono font-bold text-zinc-500">
              {completedCount} of {steps.length} Milestones Complete
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
            Your 3-Step Fast Track to KYRO-Verified Certification
          </h2>
          <p className="text-xs text-zinc-600">
            Complete these 3 core actions to unlock your verified candidate portfolio badge and 100% interview readiness.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-2xl font-black text-black font-mono font-bold">
              {progressPercent}%
            </span>
            <span className="text-[9px] uppercase font-bold text-zinc-400 block">
              Readiness Score
            </span>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center text-xs transition-colors"
            title="Dismiss widget"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
              step.completed
                ? "bg-zinc-50/50 border-zinc-200"
                : "bg-white border-zinc-200 hover:border-black hover:bg-zinc-50"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-lg shadow-2xs">
                  {step.icon}
                </div>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    step.completed
                      ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {step.completed ? "✓ COMPLETED (+35 PTS)" : `STEP ${idx + 1}`}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-black">{step.title}</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <Link
              href={step.href}
              className={`touch-target w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                step.completed
                  ? "bg-white hover:bg-zinc-100 text-black border border-zinc-300"
                  : "bg-black hover:bg-zinc-800 text-white border border-black"
              }`}
            >
              <span>{step.ctaText}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
