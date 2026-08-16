"use client";

import { useState } from "react";
import { CodeExecutionResult } from "@/lib/ai/code-reviewer";

interface ConsoleTestRunnerProps {
  result: CodeExecutionResult | null;
  isRunning?: boolean;
}

export function ConsoleTestRunner({ result, isRunning = false }: ConsoleTestRunnerProps) {
  const [activeTestIndex, setActiveTestIndex] = useState(0);

  if (isRunning) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-black uppercase tracking-wider">
            Executing test suite in sandbox...
          </span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex items-center justify-center min-h-[220px] text-center">
        <div className="space-y-1">
          <span className="text-2xl block mb-1">⚡</span>
          <p className="text-xs font-bold text-black">Console & Test Execution Panel</p>
          <p className="text-[11px] text-zinc-500">
            Click <strong>Run Code</strong> above to execute your solution against assertions.
          </p>
        </div>
      </div>
    );
  }

  const activeTest = result.testCaseResults[activeTestIndex] || result.testCaseResults[0];

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 shadow-sm">
      {/* Run Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black border uppercase tracking-wider ${
              result.passed
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-rose-50 text-rose-700 border-rose-300"
            }`}
          >
            {result.passed ? "✓ All Tests Passed" : "✕ Test Failures Detected"}
          </span>
          <span className="text-xs font-mono font-bold text-zinc-600">
            {result.totalPassed}/{result.totalTests} Passed
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-zinc-500">
          <span>⏱️ {result.runtimeMs}ms Runtime</span>
          <span>💾 {result.memoryMb}MB Memory</span>
        </div>
      </div>

      {/* Test Case Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {result.testCaseResults.map((tc, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTestIndex(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              activeTestIndex === idx
                ? "bg-black text-white border-black"
                : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tc.passed ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span>Case {idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Selected Test Case Details */}
      {activeTest && (
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 font-mono text-xs">
          <div>
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold block mb-1">
              Input:
            </span>
            <div className="p-2.5 bg-white border border-zinc-200 rounded-xl text-black select-all">
              {activeTest.input}
            </div>
          </div>

          <div>
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold block mb-1">
              Expected Output:
            </span>
            <div className="p-2.5 bg-white border border-zinc-200 rounded-xl text-emerald-700 font-bold select-all">
              {activeTest.expected}
            </div>
          </div>

          <div>
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold block mb-1">
              Actual Output:
            </span>
            <div
              className={`p-2.5 bg-white border rounded-xl select-all ${
                activeTest.passed
                  ? "border-emerald-300 text-emerald-700 font-bold"
                  : "border-rose-300 text-rose-700 font-bold"
              }`}
            >
              {activeTest.actual}
            </div>
          </div>

          {activeTest.stdout && (
            <div>
              <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-bold block mb-1">
                Stdout / Logs:
              </span>
              <div className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 whitespace-pre-wrap select-all">
                {activeTest.stdout}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
