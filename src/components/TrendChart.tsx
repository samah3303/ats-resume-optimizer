"use client";

interface TrendChartProps {
  data: Array<{ date: string; score: number }>;
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
      <div className="flex items-center justify-center h-[200px] bg-zinc-50 rounded-2xl border border-zinc-200">
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No score trend data available</p>
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
                stroke="#E4E4E7"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <text
                x={padLeft - 2}
                y={y + 1}
                textAnchor="end"
                className="fill-zinc-400 font-mono"
                style={{ fontSize: "3.5px" }}
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

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={scaledHeight}
                fill="#000000"
                rx="0.8"
                ry="0.8"
                className="transition-all duration-300 hover:fill-zinc-700"
              />
              {/* Score label */}
              <text
                x={x + barW / 2}
                y={Math.max(4, y - 2)}
                textAnchor="middle"
                className="fill-black font-black font-mono"
                style={{ fontSize: "3px" }}
              >
                {entry.score}
              </text>
              {/* Date label */}
              <text
                x={x + barW / 2}
                y={95}
                textAnchor="middle"
                className="fill-zinc-500 font-mono font-bold"
                style={{ fontSize: "2.5px" }}
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
