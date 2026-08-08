"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/dashboard/studio", label: "Studio", emoji: "⚡" },
  { href: "/dashboard/roadmap", label: "Roadmap", emoji: "🗺️" },
  { href: "/dashboard/tracker", label: "Tracker", emoji: "📊" },
  { href: "/dashboard/tools", label: "All Tools", emoji: "🧩" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Mobile main navigation"
    >
      {/* Glassmorphic backdrop with blur */}
      <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-2xl" />

      {/* Fixed 4-Column Touch Target Grid */}
      <div
        className="relative grid grid-cols-4 items-center px-2 py-1"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)",
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {mobileLinks.map((link) => {
          const isActive =
            link.href === "/dashboard/studio"
              ? pathname === "/dashboard/studio" || pathname === "/dashboard" || pathname === "/dashboard/analyze"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-2xl transition-all duration-200 min-h-[48px] ${
                isActive
                  ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm" />
                )}
                <span className="text-xl" aria-hidden="true">
                  {link.emoji}
                </span>
              </span>
              <span
                className={`text-[11px] leading-none ${
                  isActive
                    ? "font-extrabold text-indigo-800 dark:text-indigo-300"
                    : "font-semibold text-slate-600 dark:text-slate-400"
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
