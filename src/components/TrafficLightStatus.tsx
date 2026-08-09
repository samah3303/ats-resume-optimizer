"use client";

interface TrafficLightStatusProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
}

export default function TrafficLightStatus({ score, size = "md" }: TrafficLightStatusProps) {
  if (score === null || score === undefined) return null;

  let status: "green" | "yellow" | "red" = "red";
  let label = "High Rejection Risk";
  let subtext = "Score is under 50%. High automated ATS cutoff risk. Tweak bullets below.";
  let badgeBg = "bg-rose-950/80 text-rose-300 border-rose-800";
  let dotColor = "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]";

  if (score >= 75) {
    status = "green";
    label = "Ready to Apply";
    subtext = "Green light! Strong ATS keyword match. Safe to submit application.";
    badgeBg = "bg-emerald-950/80 text-emerald-300 border-emerald-800";
    dotColor = "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]";
  } else if (score >= 50) {
    status = "yellow";
    label = "2-3 Quick Fixes Needed";
    subtext = "Yellow light. Add 2-3 missing hard skills to reach 80%+ match rate.";
    badgeBg = "bg-amber-950/80 text-amber-300 border-amber-800";
    dotColor = "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]";
  }

  if (size === "sm") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${badgeBg}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
        <span>{label} ({score}%)</span>
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div className={`p-5 rounded-3xl border ${badgeBg} space-y-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-3.5 h-3.5 rounded-full ${dotColor} animate-pulse`} />
            <span className="text-sm font-black uppercase tracking-wider">{label}</span>
          </div>
          <span className="text-xl font-black font-mono">{score}% Match</span>
        </div>
        <p className="text-xs opacity-90 leading-relaxed font-medium">{subtext}</p>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-black border ${badgeBg}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{label} • {score}% Score</span>
    </div>
  );
}
