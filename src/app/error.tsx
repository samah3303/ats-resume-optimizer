"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("[Application Error Caught by error.tsx]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-nordic-bg text-nordic-text flex flex-col font-sans selection:bg-nordic-secondary selection:text-nordic-text">
      <header className="sticky top-0 z-50 bg-nordic-primary text-white shadow-xs">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Logo theme="on-blue" size="md" href="/" />
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-wider text-white hover:text-nordic-secondary transition-colors"
          >
            Dashboard &rarr;
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-nordic-error/10 text-nordic-error mx-auto flex items-center justify-center font-bold text-2xl">
            ⚠
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-nordic-text">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
              An unexpected system exception occurred. Our telemetry has logged the issue for investigation.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-nordic-neutral bg-nordic-bg p-1.5 rounded">
                Reference ID: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="nordic-btn-primary flex-1 h-11 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Try Again ↻
            </button>
            <Link
              href="/dashboard"
              className="nordic-btn-outline flex-1 h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-nordic-border bg-white py-6 text-center text-xs text-nordic-neutral">
        &copy; {new Date().getFullYear()} paniund. Democratic ATS Career Operating System.
      </footer>
    </div>
  );
}
