"use client";

import { useState } from "react";
import { Challenge } from "@/lib/challenges/data";

interface ProblemViewProps {
  challenge: Challenge;
}

export function ProblemView({ challenge }: { challenge: Challenge }) {
  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm overflow-y-auto h-full">
      {/* Title & Metadata Header */}
      <div className="space-y-3 pb-4 border-b border-zinc-200">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black border uppercase tracking-wider ${getDifficultyBadge(
              challenge.difficulty
            )}`}
          >
            {challenge.difficulty}
          </span>
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-zinc-100 border border-zinc-200 text-zinc-800">
            {challenge.category}
          </span>
          <span className="text-xs font-mono text-zinc-500 font-bold ml-auto">
            {challenge.acceptanceRate}% Acceptance
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
          {challenge.title}
        </h1>
      </div>

      {/* Problem Description */}
      <div className="text-xs sm:text-sm text-zinc-900 leading-relaxed whitespace-pre-line font-sans space-y-4">
        {challenge.description}
      </div>

      {/* Examples */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Examples
        </h3>
        {challenge.examples.map((ex, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 font-mono text-xs"
          >
            <div className="text-zinc-500 font-bold text-[11px]">Example {idx + 1}:</div>
            <div className="space-y-1">
              <div>
                <span className="text-zinc-500">Input: </span>
                <span className="text-black font-bold">{ex.input}</span>
              </div>
              <div>
                <span className="text-zinc-500">Output: </span>
                <span className="text-black font-bold">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="text-[11px] text-zinc-600 font-sans pt-1">
                  <span className="text-zinc-500 font-mono">Explanation: </span>
                  {ex.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Constraints
        </h3>
        <ul className="space-y-1 text-xs font-mono text-zinc-700 list-disc list-inside">
          {challenge.constraints.map((c, idx) => (
            <li key={idx} className="leading-relaxed">
              <code>{c}</code>
            </li>
          ))}
        </ul>
      </div>

      {/* Progressive Hints Accordion */}
      {challenge.hints && challenge.hints.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-zinc-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
            <span>💡</span> Progressive Interview Hints
          </h3>

          <div className="space-y-2">
            {challenge.hints.map((hint, idx) => {
              const isOpen = openHintIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenHintIndex(isOpen ? null : idx)}
                    className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100 text-left text-xs font-bold text-black flex items-center justify-between transition-colors"
                  >
                    <span>Hint {idx + 1}</span>
                    <span className="text-zinc-400 font-mono">{isOpen ? "▲" : "▼"}</span>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-zinc-700 leading-relaxed border-t border-zinc-200">
                      {hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
