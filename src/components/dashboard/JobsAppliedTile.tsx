"use client";

import Link from "next/link";

interface JobsAppliedTileProps {
  totalApplied: number;
  byStage: Record<string, number>;
}

export default function JobsAppliedTile({
  totalApplied,
  byStage,
}: JobsAppliedTileProps) {
  const stages = [
    { key: "WISHLIST", label: "Wishlist", dot: "bg-nordic-neutral" },
    { key: "APPLIED", label: "Applied", dot: "bg-nordic-primary" },
    { key: "SCREENING", label: "Screening", dot: "bg-nordic-secondary" },
    { key: "INTERVIEW", label: "Interview", dot: "bg-nordic-warning" },
    { key: "OFFER", label: "Offer", dot: "bg-nordic-success" },
  ];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-secondary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Applications
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-neutral">TRACKER</span>
        </div>

        {/* Primary Count */}
        <div className="flex items-baseline justify-between my-4 p-4 bg-nordic-bg rounded-[4px] border border-nordic-border">
          <div>
            <div className="text-4xl font-bold tracking-tight text-nordic-text leading-none font-mono">
              {totalApplied}
            </div>
            <div className="text-xs font-medium text-nordic-text-secondary mt-2">
              Applications tracked
            </div>
          </div>
          <div className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-nordic-border rounded-[4px] text-nordic-primary">
            BY STAGE
          </div>
        </div>

        {/* Breakdown by Stage */}
        <div className="space-y-2 text-xs my-4">
          {stages.map((st) => {
            const count =
              st.key === "SCREENING"
                ? (byStage["phone_screen"] || byStage["screening"] || 0)
                : (byStage[st.key] || byStage[st.key.toLowerCase()] || 0);
            return (
              <div
                key={st.key}
                className="flex items-center justify-between py-1.5 border-b border-nordic-border text-nordic-text-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                  <span className="font-medium text-nordic-text">{st.label}</span>
                </div>
                <span className="font-mono font-bold text-nordic-text">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <Link
          href="/dashboard/tracker"
          className="nordic-btn-secondary w-full text-xs h-10 font-bold uppercase tracking-wide text-center flex items-center justify-center"
        >
          View Tracker
        </Link>
      </div>
    </div>
  );
}
