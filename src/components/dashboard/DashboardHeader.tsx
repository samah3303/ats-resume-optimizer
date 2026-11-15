"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
}

export const DASHBOARD_NAV_ITEMS = [
  {
    name: "Dashboard",
    shortName: "Home",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Jobs",
    shortName: "Jobs",
    href: "/dashboard/jobs",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    name: "Tracker",
    shortName: "Tracker",
    href: "/dashboard/tracker",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
    ),
  },
  {
    name: "Profile",
    shortName: "Profile",
    href: "/dashboard/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const userInitial = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const isAdmin = user?.role === "admin" || user?.email === "demo@paniund.com";

  return (
    <header className="sticky top-0 z-40 bg-nordic-primary text-white shadow-sm" role="banner">
      <div className="flex h-13 sm:h-[60px] items-center justify-between px-3.5 sm:px-8 max-w-[1400px] mx-auto w-full">
        {/* Logo Left */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Logo theme="on-blue" href="/dashboard" />

          {/* Quick search input (desktop only) */}
          <div className="hidden lg:flex items-center bg-white rounded-[4px] px-3 h-9 w-72 text-sm text-nordic-text border border-transparent focus-within:ring-2 focus-within:ring-nordic-secondary">
            <svg
              className="w-4 h-4 text-nordic-text-secondary mr-2 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              aria-label="Search jobs, skills, and keywords"
              placeholder="Search jobs, skills, keywords..."
              className="bg-transparent border-none outline-none text-xs w-full text-nordic-text placeholder-nordic-text-secondary"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(
                    `/dashboard/jobs?q=${encodeURIComponent(
                      (e.target as HTMLInputElement).value
                    )}`
                  );
                }
              }}
            />
          </div>
        </div>

        {/* User Badge & Actions Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="h-9 sm:h-9 px-2.5 sm:px-3 rounded-[4px] bg-nordic-secondary text-nordic-text hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs tap-active touch-target"
              title="Admin Control Center"
              aria-label="Admin Control Center"
            >
              <span aria-hidden="true">⚡</span>
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Desktop User Info */}
          <div className="hidden sm:flex flex-col text-right text-xs">
            <span className="font-bold text-white leading-tight">
              {user?.name || user?.email?.split("@")[0]}
            </span>
            <span className="text-[11px] text-white/80">{user?.email}</span>
          </div>

          <div
            className="h-8 w-[1px] bg-white/20 hidden sm:block"
            aria-hidden="true"
          />

          {/* Mobile User Avatar pill */}
          <Link
            href="/dashboard/profile"
            className="sm:hidden touch-target w-11 h-11 flex items-center justify-center tap-active"
            title="View Profile"
            aria-label={`View profile for ${user?.name || "current user"}`}
          >
            <span className="w-8 h-8 rounded-full bg-nordic-secondary text-nordic-primary font-bold text-xs flex items-center justify-center shadow-xs">
              {userInitial}
            </span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sign out of account"
            className="h-9 sm:h-9 px-2.5 sm:px-3.5 rounded-[4px] bg-nordic-primary-hover hover:bg-nordic-secondary hover:text-nordic-text text-white text-xs font-bold transition-colors cursor-pointer tap-active flex items-center justify-center touch-target"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ==================== SECONDARY NAVIGATION BAR (Desktop Only 44px) ==================== */}
      <nav
        aria-label="Desktop primary navigation"
        className="hidden md:block bg-white border-b border-nordic-border shadow-xs"
      >
        <div className="flex h-[44px] items-center px-4 sm:px-8 max-w-[1400px] mx-auto w-full overflow-x-auto gap-8">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`h-full flex items-center text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  isActive
                    ? "text-nordic-primary font-bold border-b-[3px] border-nordic-primary"
                    : "text-nordic-text-secondary hover:text-nordic-text"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
