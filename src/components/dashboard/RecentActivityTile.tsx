"use client";

export default function RecentActivityTile() {
  const events = [
    { title: "Resume scanned", time: "Just now", badge: "bg-[#0A8A00]" },
    { title: "Profile updated", time: "2 hrs ago", badge: "bg-[#003399]" },
    { title: "Job matches updated", time: "1 day ago", badge: "bg-[#FFDA1A]" },
  ];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFDA1A] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Recent Activity
            </h3>
          </div>
          <span className="text-xs font-mono text-[#767676]">ACTIVITY</span>
        </div>

        <div className="space-y-3 text-xs my-4">
          {events.map((ev, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-[#DFDFDF]"
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className={`w-2 h-2 rounded-full ${ev.badge} shrink-0`} />
                <span className="truncate font-medium text-[#111111]">{ev.title}</span>
              </div>
              <span className="text-[11px] font-mono text-[#767676] shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
        <div className="text-[11px] text-[#767676] text-center font-medium">
          Your latest actions appear here
        </div>
      </div>
    </div>
  );
}
