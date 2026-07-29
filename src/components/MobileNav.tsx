"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/dashboard/resumes", label: "Resumes", emoji: "📄" },
  { href: "/dashboard/jds", label: "Jobs", emoji: "💼" },
  { href: "/dashboard/analyze", label: "Analyze", emoji: "🔍" },
  { href: "/dashboard/outreach", label: "Outreach", emoji: "✉️" },
  { href: "/dashboard/interview", label: "Prep", emoji: "🎙️" },
  { href: "/dashboard/builder", label: "Builder", emoji: "📥" },
  { href: "/dashboard/tracker", label: "Track", emoji: "📊" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-700/60" />

      {/* Safe area padding + scrollable links */}
      <div
        className="relative flex items-center gap-1 overflow-x-auto px-2"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: "calc(56px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {mobileLinks.map((link) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col flex-shrink-0 items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] ${
                isActive
                  ? "text-indigo-700 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              {/* Active indicator */}
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300" />
                )}
                <span className="text-xl" aria-hidden="true">
                  {link.emoji}
                </span>
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-indigo-700 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
