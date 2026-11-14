"use client";

interface JobSearchTipsTileProps {
  tips: string[];
}

export default function JobSearchTipsTile({ tips }: JobSearchTipsTileProps) {
  const defaultTips = [
    "Apply to jobs posted in the last 3 days for the fastest response.",
    "Match your profile summary with keywords from the jobs you want.",
    "Highlight past work that directly solves what the employer needs.",
  ];

  const items = tips.length > 0 ? tips.slice(0, 3) : defaultTips;

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFDA1A] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Job Search Tips
            </h3>
          </div>
          <span className="text-xs font-mono text-[#0A8A00] font-semibold">TIPS</span>
        </div>

        <div className="space-y-3 text-xs my-4">
          {items.map((tip, idx) => (
            <div
              key={idx}
              className="border border-[#DFDFDF] p-3 rounded-[4px] bg-white flex gap-3 items-start"
            >
              <span className="w-2 h-2 bg-[#003399] rounded-full mt-1.5 shrink-0" />
              <p className="text-xs leading-relaxed text-[#111111]">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
        <div className="text-[11px] text-[#767676] text-center font-medium">
          Simple tips to help you get more interviews
        </div>
      </div>
    </div>
  );
}
