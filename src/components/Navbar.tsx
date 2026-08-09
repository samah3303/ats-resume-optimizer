"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import Logo from "./Logo";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/studio", label: "Studio ⚡" },
  { href: "/dashboard/roadmap", label: "2-Month Roadmap 🗺️" },
  { href: "/dashboard/tracker", label: "Tracker 📊" },
  { href: "/dashboard/how-to-use", label: "How to Use 📖" },
  { href: "/dashboard/tools", label: "All Tools 🧩" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="bg-white/95 dark:bg-[#0D0E11]/95 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

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
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-900 text-amber-400 dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80"
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
                  href="/dashboard/studio"
                  className="md:hidden px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                >
                  Studio ⚡
                </Link>
                <ProfileDropdown />
              </div>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-all shadow-sm"
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
