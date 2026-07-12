"use client";

interface TrendChartProps {
  data: Array<{ date: string; score: number }>;
}

function getBarColor(score: number): string {
  if (score >= 70) return "#22c55e"; // green-500
  if (score >= 50) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function TrendChart({ data }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-400">No data</p>
      </div>
    );
  }

  // Take last 10 entries
  const entries = data.slice(-10);
  const maxScore = 100;
  const barWidth = 100 / entries.length;

  // Padding constants
  const padLeft = 40;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 30;
  const chartHeight = 200;
  const chartWidth = "100%";
  const innerWidth = `calc(${chartWidth} - ${padLeft + padRight}px)`;

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <svg
        viewBox={`0 0 100 100`}
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ overflow: "visible" }}
      >
        {/* Background grid lines */}
        {yTicks.map((tick) => {
          const y = padTop + ((maxScore - tick) / maxScore) * (100 - padTop - padBottom);
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={100 - padRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
              <text
                x={padLeft - 4}
                y={y + 1}
                textAnchor="end"
                className="fill-gray-400"
                style={{ fontSize: "3px", fontFamily: "system-ui" }}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {entries.map((entry, i) => {
          const x = padLeft + i * barWidth + barWidth * 0.15;
          const barW = barWidth * 0.7;
          const scaledHeight = (entry.score / maxScore) * (100 - padTop - padBottom);
          const y = padTop + (100 - padTop - padBottom) - scaledHeight;
          const color = getBarColor(entry.score);

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={scaledHeight}
                fill={color}
                rx="1"
                ry="1"
                className="transition-all duration-300"
              />
              {/* Score label on top of bar */}
              <text
                x={x + barW / 2}
                y={y - 1.5}
                textAnchor="middle"
                className="fill-gray-700"
                style={{ fontSize: "3.5px", fontFamily: "system-ui", fontWeight: 600 }}
              >
                {entry.score}
              </text>
              {/* Date label below */}
              <text
                x={x + barW / 2}
                y={100 - padBottom + 8}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: "3px", fontFamily: "system-ui" }}
              >
                {formatDateLabel(entry.date)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
