"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileLinks = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/dashboard/analyze", label: "Analyze", emoji: "🔍" },
  { href: "/dashboard/jds", label: "Jobs", emoji: "💼" },
  { href: "/dashboard/tracker", label: "Track", emoji: "📊" },
  { href: "/dashboard/how-to-use", label: "Guide", emoji: "📖" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/60" />

      {/* Safe area padding */}
      <div
        className="relative flex items-center justify-around px-2"
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
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive
                  ? "text-indigo-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {/* Active indicator */}
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-500" />
                )}
                <span className="text-xl">{link.emoji}</span>
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-indigo-700" : "text-slate-500"
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
