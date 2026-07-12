"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/resumes", label: "Resumes" },
  { href: "/dashboard/positions", label: "Positions" },
  { href: "/dashboard/jds", label: "JDs" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-indigo-800 to-indigo-600">
              <span className="text-white font-bold text-sm">ATS</span>
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">
              ATS Optimizer
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
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
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
                {/* Mobile nav */}
                <Link
                  href="/dashboard/analyze"
                  className="md:hidden px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-indigo-800 to-indigo-600 text-white hover:from-indigo-900 hover:to-indigo-700 transition-all shadow-sm"
                >
                  Analyze
                </Link>
                <span className="text-sm text-slate-600 hidden sm:block">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Logout
                </button>
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
