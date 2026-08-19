"use client";

import { useSession, signIn } from "next-auth/react";
import Logo from "./Logo";

export default function Navbar() {
  const { data: session } = useSession();
  const unreadCount = 0;

  return (
    <nav
      className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-50 transition-colors"
      role="navigation"
      aria-label="Top navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: KYRO Monogram & Brand Logo */}
          <Logo size="md" />

          {/* Right: Notifications ONLY (Zero Avatar/Profile in Top Bar) */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                className="relative p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <span className="text-lg" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 border border-black transition-all shadow-sm cursor-pointer"
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
