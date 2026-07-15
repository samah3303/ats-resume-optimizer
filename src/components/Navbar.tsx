"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/resumes", label: "Resumes" },
  { href: "/dashboard/jds", label: "Jobs" },
  { href: "/dashboard/tracker", label: "Tracker" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 shrink-0"
          >
            <svg className="w-8 h-8" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="256" cy="256" r="256" fill="url(#nav-gradient)"/>
              <defs>
                <linearGradient id="nav-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#312E81"/>
                  <stop offset="100%" stopColor="#4338CA"/>
                </linearGradient>
              </defs>
              <rect x="136" y="110" width="200" height="265" rx="22" fill="white" opacity="0.92"/>
              <rect x="162" y="150" width="128" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <rect x="162" y="170" width="100" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <rect x="162" y="200" width="146" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <rect x="162" y="220" width="118" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <rect x="162" y="250" width="136" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <rect x="162" y="270" width="92" height="9" rx="4.5" fill="#312E81" opacity="0.12"/>
              <path d="M282 150 L322 168 L322 242 Q322 316 282 344 Q242 316 242 242 L242 168 Z" fill="url(#nav-shield)"/>
              <defs>
                <linearGradient id="nav-shield" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6366F1"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
              <path d="M252 258 L266 272 L294 240" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">
              ResuMatch
            </span>
          </Link>

          {/* Nav links — only when logged in */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/analyze"
                  className="md:hidden px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-indigo-800 to-indigo-600 text-white"
                >
                  Analyze
                </Link>
                <ProfileDropdown />
              </div>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-indigo-800 to-indigo-600 text-white hover:from-indigo-900 hover:to-indigo-700 transition-all shadow-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
