"use client";

interface TrafficLightStatusProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export default function TrafficLightStatus({ score, size = "md" }: TrafficLightStatusProps) {
  if (score === null || score === undefined) return null;

  let label = "High Rejection Risk";
  let subtext = "Score is under 50%. High automated ATS cutoff risk. Tweak bullets below.";
  let badgeBg = "bg-rose-50 text-rose-900 border-rose-200";
  let dotColor = "bg-rose-600";

  if (score >= 75) {
    label = "Ready to Apply";
    subtext = "Green light! Strong ATS keyword match. Safe to submit application.";
    badgeBg = "bg-emerald-50 text-emerald-900 border-emerald-200";
    dotColor = "bg-emerald-600";
  } else if (score >= 50) {
    label = "2-3 Quick Fixes Needed";
    subtext = "Yellow light. Add 2-3 missing hard skills to reach 80%+ match rate.";
    badgeBg = "bg-amber-50 text-amber-900 border-amber-200";
    dotColor = "bg-amber-600";
  }

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeBg}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span>{score}%</span>
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className={`p-5 rounded-2xl border ${badgeBg} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            <span className="text-sm font-black uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-xl font-black font-mono">{score}% Match</span>
        </div>
        <p className="text-xs leading-relaxed font-medium">{subtext}</p>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${badgeBg}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label} • {score}% Score</span>
    </div>
  );
}
