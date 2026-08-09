"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/dashboard/studio", label: "Studio", emoji: "⚡" },
  { href: "/dashboard/roadmap", label: "Roadmap", emoji: "🗺️" },
  { href: "/dashboard/tracker", label: "Tracker", emoji: "📊" },
  { href: "/dashboard/how-to-use", label: "Guide", emoji: "📖" },
  { href: "/dashboard/tools", label: "Tools", emoji: "🧩" },
];

export default function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Only render bottom navigation for authenticated logged-in users
  if (!session?.user) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Mobile main navigation"
    >
      {/* Glassmorphic backdrop with carbon black / warm yellow theme */}
      <div className="absolute inset-0 bg-white/95 dark:bg-[#0D0E11]/95 backdrop-blur-xl border-t border-amber-500/20 shadow-2xl" />

      {/* Fixed 5-Column Touch Target Grid */}
      <div
        className="relative grid grid-cols-5 items-center px-1.5 py-1"
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
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] ${
                isActive
                  ? "bg-slate-900 text-amber-400 dark:bg-amber-500/20 dark:text-amber-300 font-bold shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-amber-500 shadow-sm" />
                )}
                <span className="text-lg" aria-hidden="true">
                  {link.emoji}
                </span>
              </span>
              <span
                className={`text-[10px] leading-none ${
                  isActive
                    ? "font-extrabold text-amber-500 dark:text-amber-300"
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
