"use client";

import { useSession, signIn } from "next-auth/react";
import Logo from "./Logo";

export default function Navbar() {
  const { data: session } = useSession();
  const unreadCount = 0;

  return (
    <nav
      className="bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] sticky top-0 z-50 transition-colors"
      role="navigation"
      aria-label="Top navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: paniund wordmark */}
          <Logo size="md" />

          {/* Right: Notifications ONLY */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                className="relative p-2 text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#18181B] rounded-full transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <span className="text-base" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FAFAFA] text-[10px] font-bold text-[#09090B]">
                    {unreadCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FAFAFA] text-[#09090B] hover:bg-zinc-200 border border-[#FAFAFA] transition-all cursor-pointer"
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
