"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import SessionProvider from "@/components/SessionProvider";
import Logo from "@/components/Logo";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] font-sans text-sm text-[#484848]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#003399] border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const navItems = [
    {
      name: "Dashboard",
      shortName: "Home",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Jobs",
      shortName: "Jobs",
      href: "/dashboard/jobs",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Tracker",
      shortName: "Tracker",
      href: "/dashboard/tracker",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      name: "Profile",
      shortName: "Profile",
      href: "/dashboard/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const userInitial = (session?.user?.name || session?.user?.email || "U")
    .charAt(0)
    .toUpperCase();

  const role = (session?.user as { role?: string })?.role;
  const isAdmin = role === "admin" || session?.user?.email === "demo@paniund.com";

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111] flex flex-col font-sans selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* Skip to Main Content Link (WCAG 2.1 AA 2.4.1 Bypass Blocks) */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* ==================== TOP NAVIGATION BAR (Desktop 60px / Mobile 54px) ==================== */}
      <header className="sticky top-0 z-40 bg-[#003399] text-white shadow-sm" role="banner">
        <div className="flex h-13 sm:h-[60px] items-center justify-between px-3.5 sm:px-8 max-w-[1400px] mx-auto w-full">
          {/* Logo Left */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo theme="on-blue" href="/dashboard" />

            {/* Quick search input (desktop only) */}
            <div className="hidden lg:flex items-center bg-white rounded-[4px] px-3 h-9 w-72 text-sm text-[#111111] border border-transparent focus-within:ring-2 focus-within:ring-[#FFDA1A]">
              <svg className="w-4 h-4 text-[#484848] mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                aria-label="Search jobs, skills, and keywords"
                placeholder="Search jobs, skills, keywords..."
                className="bg-transparent border-none outline-none text-xs w-full text-[#111111] placeholder-[#484848]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/dashboard/jobs?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
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
                className="h-9 sm:h-9 px-2.5 sm:px-3 rounded-[4px] bg-[#FFDA1A] text-[#111111] hover:bg-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs tap-active touch-target"
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
                {session?.user?.name || session?.user?.email?.split("@")[0]}
              </span>
              <span className="text-[11px] text-white/80">
                {session?.user?.email}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-white/20 hidden sm:block" aria-hidden="true" />

            {/* Mobile User Avatar pill with 44x44px touch target */}
            <Link
              href="/dashboard/profile"
              className="sm:hidden touch-target w-11 h-11 flex items-center justify-center tap-active"
              title="View Profile"
              aria-label={`View profile for ${session?.user?.name || "current user"}`}
            >
              <span className="w-8 h-8 rounded-full bg-[#FFDA1A] text-[#003399] font-bold text-xs flex items-center justify-center shadow-xs">
                {userInitial}
              </span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out of account"
              className="h-9 sm:h-9 px-2.5 sm:px-3.5 rounded-[4px] bg-[#002B80] hover:bg-[#FFDA1A] hover:text-[#111111] text-white text-xs font-bold transition-colors cursor-pointer tap-active flex items-center justify-center touch-target"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ==================== SECONDARY NAVIGATION BAR (Desktop Only 44px) ==================== */}
        <nav aria-label="Desktop primary navigation" className="hidden md:block bg-white border-b border-[#DFDFDF] shadow-xs">
          <div className="flex h-[44px] items-center px-4 sm:px-8 max-w-[1400px] mx-auto w-full overflow-x-auto gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`h-full flex items-center text-sm font-semibold whitespace-nowrap transition-colors relative ${
                    isActive
                      ? "text-[#003399] font-bold border-b-[3px] border-[#003399]"
                      : "text-[#484848] hover:text-[#111111]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Viewport (padded on mobile for bottom bar) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-[1400px] w-full mx-auto px-3 py-4 sm:p-6 lg:p-8 pb-24 md:pb-8 outline-none"
      >
        {children}
      </main>

      {/* ==================== MOBILE APP BOTTOM NAVIGATION BAR (md:hidden) ==================== */}
      <nav
        aria-label="Mobile app navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DFDFDF] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe"
      >
        <div className="grid grid-cols-4 h-15 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center relative tap-active py-1 transition-all touch-target ${
                  isActive ? "text-[#003399]" : "text-[#484848] hover:text-[#111111]"
                }`}
              >
                {/* Active indicator bar atop icon */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-[3px] bg-[#003399] rounded-b-full shadow-2xs" />
                )}
                
                <div className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`} aria-hidden="true">
                  {item.icon}
                </div>

                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? "font-bold text-[#003399]" : "font-medium"
                  }`}
                >
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Application Footer (Desktop Only) */}
      <footer className="hidden md:block border-t border-[#DFDFDF] bg-white py-6 px-4 sm:px-8 text-xs text-[#767676] mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#003399] inline-block" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#FFDA1A] inline-block" />
            <span className="font-bold text-[#111111] lowercase">paniund</span>
            <span>• Democratic ATS Career Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/dashboard" className="hover:text-[#003399] transition-colors">Overview</Link>
            <span>•</span>
            <Link href="/dashboard/jobs" className="hover:text-[#003399] transition-colors">Jobs</Link>
            <span>•</span>
            <Link href="/dashboard/tracker" className="hover:text-[#003399] transition-colors">Tracker</Link>
            <span>•</span>
            <Link href="/dashboard/profile" className="hover:text-[#003399] transition-colors">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}
