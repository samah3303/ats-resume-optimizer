"use client";

import { useEffect, useState } from "react";

interface Step {
  id: string;
  label: string;
  detail: string;
}

const SCAN_STEPS: Step[] = [
  { id: "parse", label: "Parsing Resume Structure", detail: "Extracting skills, experience sections & bullet metrics..." },
  { id: "keywords", label: "Matching Tech Stack & JD Keywords", detail: "Benchmarking hard skills against job requirements..." },
  { id: "format", label: "Auditing ATS Scannability", detail: "Checking single-column formatting, headers & contact info..." },
  { id: "ai", label: "Generating Tailored AI Optimization Plan", detail: "Formulating STAR bullet rewriter suggestions..." },
];

export default function ScanProgressVisualizer({ isScanning }: { isScanning: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl text-white my-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping" />
        <h3 className="text-base font-black text-amber-300 uppercase tracking-wider">AI ATS Deep Audit in Progress...</h3>
      </div>

      <div className="space-y-4">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-3.5 rounded-2xl transition-all duration-500 ${
                isCurrent
                  ? "bg-[#090A0C] border border-amber-500/50 shadow-md"
                  : isDone
                  ? "opacity-75"
                  : "opacity-40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black animate-spin">
                    ⚙
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full border border-zinc-700 text-zinc-500 flex items-center justify-center text-xs font-mono">
                    {idx + 1}
                  </span>
                )}
              </div>

              <div>
                <p className={`text-xs font-bold ${isCurrent ? "text-amber-300" : isDone ? "text-zinc-300" : "text-zinc-500"}`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
