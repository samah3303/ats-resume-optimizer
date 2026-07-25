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
      <div className="flex items-center justify-center h-[200px] bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400">No score trend data available</p>
      </div>
    );
  }

  // Take last 10 entries
  const entries = data.slice(-10);
  const maxScore = 100;
  
  // ViewBox bounds (0 to 100)
  const padLeft = 12;
  const padRight = 4;
  const padTop = 15;
  const padBottom = 20;
  const availableWidth = 100 - padLeft - padRight;
  const barWidth = availableWidth / entries.length;

  // Y-axis ticks
  const yTicks = [0, 50, 100];

  return (
    <div className="w-full max-w-full overflow-hidden py-2" style={{ height: 200 }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
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
                stroke="#e2e8f0"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={padLeft - 2}
                y={y + 1}
                textAnchor="end"
                className="fill-slate-400"
                style={{ fontSize: "3.5px", fontFamily: "system-ui" }}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {entries.map((entry, i) => {
          const x = padLeft + i * barWidth + barWidth * 0.15;
          const barW = Math.max(1, barWidth * 0.7);
          const scaledHeight = Math.max(1, (entry.score / maxScore) * (100 - padTop - padBottom));
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
                rx="0.8"
                ry="0.8"
                className="transition-all duration-300 hover:opacity-80"
              />
              {/* Score label */}
              <text
                x={x + barW / 2}
                y={Math.max(4, y - 2)}
                textAnchor="middle"
                className="fill-slate-700 font-bold"
                style={{ fontSize: "3px", fontFamily: "system-ui" }}
              >
                {entry.score}
              </text>
              {/* Date label */}
              <text
                x={x + barW / 2}
                y={95}
                textAnchor="middle"
                className="fill-slate-400"
                style={{ fontSize: "2.5px", fontFamily: "system-ui" }}
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
