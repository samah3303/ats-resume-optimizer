"use client";

import React, { useState } from "react";

export interface ScorePoint {
  score: number;
  date: string;
  jobTitle?: string;
}

export interface ScoreTrendChartProps {
  scores?: ScorePoint[];
  height?: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function getPointColor(score: number): { fill: string; stroke: string; text: string } {
  if (score >= 75) {
    return {
      fill: "#10b981", // emerald-500
      stroke: "#059669", // emerald-600
      text: "text-emerald-400",
    };
  }
  if (score >= 50) {
    return {
      fill: "#f59e0b", // amber-500
      stroke: "#d97706", // amber-600
      text: "text-amber-400",
    };
  }
  return {
    fill: "#f43f5e", // rose-500
    stroke: "#e11d48", // rose-600
    text: "text-rose-400",
  };
}

export default function ScoreTrendChart({
  scores = [],
  height = 60,
}: ScoreTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!scores || scores.length === 0) {
    return (
      <div
        className="w-full bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-4 shadow-2xl flex flex-col items-center justify-center text-center"
        style={{ minHeight: height + 32 }}
      >
        <p className="text-xs font-mono text-slate-400 tracking-wide">
          Run your first scan to see trends
        </p>
      </div>
    );
  }

  // Dimensions for SVG viewBox coordinate space
  const viewBoxWidth = 400;
  const viewBoxHeight = Math.max(40, height);
  const padTop = 10;
  const padBottom = 10;
  const padLeft = 16;
  const padRight = 16;

  const chartWidth = viewBoxWidth - padLeft - padRight;
  const chartHeight = viewBoxHeight - padTop - padBottom;

  // Compute (x, y) coordinates for each point
  const points = scores.map((pt, i) => {
    const clampedScore = Math.max(0, Math.min(100, pt.score));
    const x =
      scores.length === 1
        ? viewBoxWidth / 2
        : padLeft + (i / (scores.length - 1)) * chartWidth;
    const y = padTop + chartHeight - (clampedScore / 100) * chartHeight;
    return { ...pt, clampedScore, x, y };
  });

  // Construct polyline / line path
  let linePath = "";
  let areaPath = "";

  if (points.length === 1) {
    const pt = points[0];
    linePath = `M ${padLeft} ${pt.y} L ${viewBoxWidth - padRight} ${pt.y}`;
    areaPath = `M ${padLeft} ${viewBoxHeight - padBottom} L ${padLeft} ${pt.y} L ${viewBoxWidth - padRight} ${pt.y} L ${viewBoxWidth - padRight} ${viewBoxHeight - padBottom} Z`;
  } else {
    linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = viewBoxHeight - padBottom;
    areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="relative w-full bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-4 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
          Score History
        </span>
        {scores.length > 0 && (
          <span className="text-xs font-mono text-amber-300 font-bold">
            Latest: {scores[scores.length - 1].score}%
          </span>
        )}
      </div>

      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="amber-sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill="url(#amber-sparkline-gradient)" />

          {/* Polyline */}
          <path
            d={linePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, index) => {
            const color = getPointColor(pt.clampedScore);
            const isHovered = hoveredIndex === index;

            return (
              <g key={index} className="cursor-pointer">
                {/* Invisible enlarged hit area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="12"
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={color.fill}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}
                {/* Visible Point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 4}
                  fill={color.fill}
                  stroke="#090A0C"
                  strokeWidth="2"
                  className="transition-all duration-150"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-2"
            style={{
              left: `${(hoveredPoint.x / viewBoxWidth) * 100}%`,
              top: `${(hoveredPoint.y / viewBoxHeight) * 100}%`,
            }}
          >
            <div className="bg-[#090A0C] border border-amber-500/40 rounded-lg px-2.5 py-1.5 shadow-2xl text-xs whitespace-nowrap backdrop-blur-xl">
              <div className="flex items-center gap-2 font-mono">
                <span
                  className={`font-black text-sm ${
                    getPointColor(hoveredPoint.clampedScore).text
                  }`}
                >
                  {hoveredPoint.clampedScore}%
                </span>
                <span className="text-slate-400 text-[10px]">
                  {formatDate(hoveredPoint.date)}
                </span>
              </div>
              {hoveredPoint.jobTitle && (
                <div className="text-[11px] text-slate-300 font-sans truncate max-w-[160px] mt-0.5">
                  {hoveredPoint.jobTitle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
