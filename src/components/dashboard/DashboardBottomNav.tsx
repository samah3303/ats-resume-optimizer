"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { DASHBOARD_NAV_ITEMS } from "./DashboardHeader";

export default function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile app navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-nordic-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-4 h-15 max-w-md mx-auto">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center relative tap-active py-1 transition-all touch-target ${
                isActive
                  ? "text-nordic-primary"
                  : "text-nordic-text-secondary hover:text-nordic-text"
              }`}
            >
              {/* Active indicator bar atop icon */}
              {isActive && (
                <span className="absolute top-0 w-8 h-[3px] bg-nordic-primary rounded-b-full shadow-2xs" />
              )}

              <div
                className={`transition-transform duration-150 ${
                  isActive ? "scale-110" : ""
                }`}
                aria-hidden="true"
              >
                {item.icon}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? "font-bold text-nordic-primary" : "font-medium"
                }`}
              >
                {item.shortName}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
