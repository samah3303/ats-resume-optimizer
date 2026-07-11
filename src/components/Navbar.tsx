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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ATS</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              ATS Optimizer
            </span>
          </Link>

          {/* Nav links — only when logged in */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {/* Mobile nav */}
                <Link
                  href="/dashboard/analyze"
                  className="md:hidden px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Analyze
                </Link>
                <span className="text-sm text-gray-700 hidden sm:block">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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
