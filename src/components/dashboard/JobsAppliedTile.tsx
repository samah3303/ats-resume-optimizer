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
    { key: "WISHLIST", label: "Wishlist", dot: "bg-[#767676]" },
    { key: "APPLIED", label: "Applied", dot: "bg-[#003399]" },
    { key: "SCREENING", label: "Screening", dot: "bg-[#FFDA1A]" },
    { key: "INTERVIEW", label: "Interview", dot: "bg-[#E87400]" },
    { key: "OFFER", label: "Offer", dot: "bg-[#0A8A00]" },
  ];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFDA1A] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Applications
            </h3>
          </div>
          <span className="text-xs font-mono text-[#767676]">TRACKER</span>
        </div>

        {/* Primary Count */}
        <div className="flex items-baseline justify-between my-4 p-4 bg-[#F5F5F5] rounded-[4px] border border-[#DFDFDF]">
          <div>
            <div className="text-4xl font-bold tracking-tight text-[#111111] leading-none font-mono">
              {totalApplied}
            </div>
            <div className="text-xs font-medium text-[#484848] mt-2">
              Applications tracked
            </div>
          </div>
          <div className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-[#DFDFDF] rounded-[4px] text-[#003399]">
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
                className="flex items-center justify-between py-1.5 border-b border-[#DFDFDF] text-[#484848]"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                  <span className="font-medium text-[#111111]">{st.label}</span>
                </div>
                <span className="font-mono font-bold text-[#111111]">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
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
