interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 70
      ? "stroke-green-500"
      : clampedScore >= 50
        ? "stroke-yellow-500"
        : "stroke-red-500";

  const textColor =
    clampedScore >= 70
      ? "text-green-600"
      : clampedScore >= 50
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={`${color} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span className={`text-2xl font-bold ${textColor}`}>
        {clampedScore}%
      </span>
    </div>
  );
}
