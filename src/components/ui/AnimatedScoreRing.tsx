"use client";

import { useEffect, useState } from "react";

interface AnimatedScoreRingProps {
  score: number; // 0 to 100
  size?: number; // diameter in px (e.g. 100)
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function AnimatedScoreRing({
  score,
  size = 110,
  strokeWidth = 8,
  label,
  sublabel,
}: AnimatedScoreRingProps) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.max(0, Math.min(100, score));
    if (end === 0) {
      setCurrentScore(0);
      return;
    }

    const duration = 750;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCurrentScore(end);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-1.5 select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E4E4E7"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#000000"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* Center Score Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-black text-black leading-none" style={{ fontSize: size * 0.26 }}>
            {currentScore}%
          </span>
          {sublabel && (
            <span className="text-[9px] uppercase font-bold text-zinc-400 mt-0.5 tracking-wider">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-xs font-bold text-black uppercase tracking-wider text-center">
          {label}
        </span>
      )}
    </div>
  );
}
