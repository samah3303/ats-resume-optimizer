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
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#003399] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Shortcuts
            </h3>
          </div>
          <span className="text-xs font-mono text-[#767676]">QUICK</span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          {links.map((lnk) => (
            <Link
              key={lnk.href}
              href={lnk.href}
              className="border border-[#DFDFDF] p-3 rounded-[4px] bg-[#F5F5F5] hover:bg-white hover:border-[#003399] transition-all flex flex-col items-center justify-center gap-2 group text-center"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-[#DFDFDF] flex items-center justify-center text-[#003399] group-hover:bg-[#FFDA1A] group-hover:text-[#111111] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#111111] group-hover:text-[#003399] transition-colors">
                {lnk.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
        <div className="text-[11px] text-[#767676] text-center font-medium">
          Quick access to your tools
        </div>
      </div>
    </div>
  );
}
