"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileLink {
  href: string;
  label: string;
  emoji: string;
  badgeCount?: number;
}

const campaignLinks: MobileLink[] = [
  { href: "/dashboard", label: "Quest", emoji: "🗺️" },
  { href: "/dashboard/builder", label: "Foundation", emoji: "🏗️" },
  { href: "/dashboard/jobs", label: "Hunt", emoji: "🤖" },
  { href: "/dashboard/interview", label: "Loop", emoji: "🎙️" },
  { href: "/dashboard/offers", label: "Close", emoji: "💰" },
];

export default function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) {
    return null;
  }

  // Hide nav on enterprise routes
  if (pathname.startsWith("/enterprise")) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Mobile main navigation"
    >
      <div className="absolute inset-0 bg-white/95 backdrop-blur-lg border-t border-zinc-200 shadow-md" />

      <div
        className="relative grid grid-cols-5 items-center px-1 py-1"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)",
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {campaignLinks.map((link, index) => {
          const isActive =
            link.href === "/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);

          const isCenterTab = index === 2;

          if (isCenterTab) {
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center justify-center -translate-y-2 min-h-[48px] active:scale-95 transition-transform"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isActive
                    ? "bg-black text-white border-2 border-black"
                    : "bg-black text-white hover:bg-zinc-800 border border-black"
                }`}>
                  <span className="text-xl" aria-hidden="true">{link.emoji}</span>
                </div>
                <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold text-black" : "font-medium text-zinc-500"}`}>
                  {link.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] active:scale-95 ${
                isActive
                  ? "text-black font-bold"
                  : "text-zinc-400 hover:text-black"
              }`}
            >
              <span className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-full bg-black shadow-sm" />
                )}
                {link.badgeCount !== undefined && link.badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-black text-white text-[9px] font-bold px-1.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-sm z-10">
                    {link.badgeCount > 99 ? '99+' : link.badgeCount}
                  </span>
                )}
                <span className="text-lg" aria-hidden="true">
                  {link.emoji}
                </span>
              </span>
              <span
                className={`text-[10px] leading-none ${
                  isActive
                    ? "font-extrabold text-black"
                    : "font-semibold text-zinc-500"
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
