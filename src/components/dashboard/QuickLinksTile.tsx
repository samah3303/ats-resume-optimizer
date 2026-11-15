"use client";

import Link from "next/link";

export default function QuickLinksTile() {
  const links = [
    { label: "Jobs", href: "/dashboard/jobs", icon: "briefcase" },
    { label: "Tracker", href: "/dashboard/tracker", icon: "kanban" },
    { label: "Profile", href: "/dashboard/profile", icon: "user" },
    { label: "Upload Resume", href: "/", icon: "document" },
  ];

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-nordic-border mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-nordic-primary rounded-[2px]" />
            <h3 className="text-sm font-bold text-nordic-text uppercase tracking-wide">
              Shortcuts
            </h3>
          </div>
          <span className="text-xs font-mono text-nordic-neutral">QUICK</span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          {links.map((lnk) => (
            <Link
              key={lnk.href}
              href={lnk.href}
              className="border border-nordic-border p-3 rounded-[4px] bg-nordic-bg hover:bg-white hover:border-nordic-primary transition-all flex flex-col items-center justify-center gap-2 group text-center"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-nordic-border flex items-center justify-center text-nordic-primary group-hover:bg-nordic-secondary group-hover:text-nordic-text transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <span className="text-xs font-bold text-nordic-text group-hover:text-nordic-primary transition-colors">
                {lnk.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-nordic-border mt-2">
        <div className="text-[11px] text-nordic-neutral text-center font-medium">
          Quick access to your tools
        </div>
      </div>
    </div>
  );
}
