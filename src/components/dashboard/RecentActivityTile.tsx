"use client";

export default function RecentActivityTile() {
  const events = [
    { title: "Resume scanned", time: "Just now", badge: "bg-nordic-success" },
    { title: "Profile updated", time: "2 hrs ago", badge: "bg-nordic-primary" },
    { title: "Job matches updated", time: "1 day ago", badge: "bg-nordic-secondary" },
  ];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-secondary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Recent Activity
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-neutral">ACTIVITY</span>
        </div>

        <div className="space-y-3 text-xs my-4">
          {events.map((ev, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-b border-nordic-border"
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className={`w-2 h-2 rounded-full ${ev.badge} shrink-0`} />
                <span className="truncate font-medium text-nordic-text">{ev.title}</span>
              </div>
              <span className="text-[11px] font-mono text-nordic-neutral shrink-0">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <div className="text-[11px] text-nordic-neutral text-center font-medium">
          Your latest actions appear here
        </div>
      </div>
    </div>
  );
}
