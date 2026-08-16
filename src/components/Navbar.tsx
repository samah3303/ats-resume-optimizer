"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";
import Logo from "./Logo";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/resumes", label: "Resumes" },
  { href: "/dashboard/tools", label: "Prep" },
  { href: "/dashboard/tracker", label: "Track" },
  { href: "/dashboard/journey", label: "Journey" },
  { href: "/dashboard/recruiter", label: "Recruiter" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const unreadCount = 0;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 transition-colors" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Nav links — only when logged in */}
          {session && (
            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-black text-white border border-black shadow-sm"
                        : "text-zinc-600 hover:text-black hover:bg-zinc-100 border border-transparent"
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
            {session && (
              <button 
                className="relative p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Notifications"
              >
                <span className="text-xl" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {session ? (
              <ProfileDropdown />
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 border border-black transition-all shadow-sm"
                aria-label="Sign in to your account"
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
