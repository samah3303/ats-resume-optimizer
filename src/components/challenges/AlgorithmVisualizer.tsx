"use client";

import { useState } from "react";

interface AlgorithmVisualizerProps {
  slug?: string;
}

export function AlgorithmVisualizer({ slug = "longest-substring" }: AlgorithmVisualizerProps) {
  const SAMPLE_ARRAY = ["a", "b", "c", "a", "b", "c", "b", "b"];
  const [leftPointer, setLeftPointer] = useState(0);
  const [rightPointer, setRightPointer] = useState(2);
  const [maxLen, setMaxLen] = useState(3);
  const [stepIndex, setStepIndex] = useState(0);

  const STEPS = [
    { left: 0, right: 0, desc: "Initialize window with left=0, right=0. Current substring: 'a' (Len: 1)", max: 1 },
    { left: 0, right: 1, desc: "Expand window right=1. Add 'b'. Substring: 'ab' (Len: 2)", max: 2 },
    { left: 0, right: 2, desc: "Expand window right=2. Add 'c'. Substring: 'abc' (Len: 3)", max: 3 },
    { left: 1, right: 3, desc: "Encounter duplicate 'a'. Slide left pointer to 1. Substring: 'bca' (Len: 3)", max: 3 },
    { left: 2, right: 4, desc: "Encounter duplicate 'b'. Slide left pointer to 2. Substring: 'cab' (Len: 3)", max: 3 },
    { left: 3, right: 5, desc: "Encounter duplicate 'c'. Slide left pointer to 3. Substring: 'abc' (Len: 3)", max: 3 },
    { left: 5, right: 6, desc: "Encounter duplicate 'b'. Slide left pointer to 5. Substring: 'cb' (Len: 2)", max: 3 },
    { left: 7, right: 7, desc: "Final character 'b'. Window reaches end. Max unique length found = 3.", max: 3 },
  ];

  const handleNextStep = () => {
    const nextIdx = (stepIndex + 1) % STEPS.length;
    setStepIndex(nextIdx);
    setLeftPointer(STEPS[nextIdx].left);
    setRightPointer(STEPS[nextIdx].right);
    setMaxLen(STEPS[nextIdx].max);
  };

  const handlePrevStep = () => {
    const prevIdx = (stepIndex - 1 + STEPS.length) % STEPS.length;
    setStepIndex(prevIdx);
    setLeftPointer(STEPS[prevIdx].left);
    setRightPointer(STEPS[prevIdx].right);
    setMaxLen(STEPS[prevIdx].max);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div className="space-y-0.5">
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
            ALGORITHM POINTER VISUALIZER
          </span>
          <h3 className="text-sm font-black text-black">
            Sliding Window & Two-Pointer Step Debugger
          </h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono font-black text-black">
            Step {stepIndex + 1}/{STEPS.length}
          </span>
          <span className="text-[9px] uppercase font-bold text-zinc-500 block">
            Max Window: {maxLen}
          </span>
        </div>
      </div>

      {/* Array Elements Box Visualizer */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-4 select-none">
          {SAMPLE_ARRAY.map((char, idx) => {
            const isInsideWindow = idx >= leftPointer && idx <= rightPointer;
            const isLeft = idx === leftPointer;
            const isRight = idx === rightPointer;

            return (
              <div key={idx} className="flex flex-col items-center space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-400">{idx}</span>
                <div
                  className={`w-12 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-base transition-all border ${
                    isInsideWindow
                      ? "bg-black text-white border-black scale-105 shadow-md"
                      : "bg-zinc-50 text-zinc-800 border-zinc-300"
                  }`}
                >
                  {char}
                </div>

                {/* Pointer Indicators */}
                <div className="h-4 flex flex-col items-center">
                  {isLeft && isRight ? (
                    <span className="text-[9px] font-black text-black uppercase">L,R</span>
                  ) : isLeft ? (
                    <span className="text-[9px] font-bold text-black uppercase">L</span>
                  ) : isRight ? (
                    <span className="text-[9px] font-bold text-black uppercase">R</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Explanation Callout */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
            Pointer State Analysis:
          </span>
          <p className="text-zinc-900 font-medium leading-relaxed">
            {STEPS[stepIndex].desc}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrevStep}
            className="touch-target px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-black text-xs font-bold rounded-xl transition-all"
          >
            &larr; Previous Step
          </button>
          <button
            onClick={handleNextStep}
            className="touch-target px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Next Step &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
