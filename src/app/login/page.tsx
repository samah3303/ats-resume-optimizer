"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SessionProvider from "@/components/SessionProvider";
import Logo from "@/components/Logo";

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLogin = async () => {
    setEmail("demo@paniund.com");
    setPassword("demo123");
    setError("");
    setDemoLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: "demo@paniund.com",
        password: "demo123",
      });

      if (res?.error) {
        setError("Demo sign-in failed. Please verify database seeding.");
        setDemoLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected system exception occurred during demo login.");
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected system exception occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4 py-12 selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" className="mb-8" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm overflow-hidden">
        {/* Top Brand Accent Bar */}
        <div className="h-1.5 bg-[#003399] w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-[#484848] mt-1">
              Sign in to view your resume score, matched jobs, and applications.
            </p>
          </div>

          {error && (
            <div className="mb-6 border border-[#CC0008] bg-[#CC0008]/10 text-[#CC0008] p-3 rounded-[4px] text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide">
                  Password
                </label>
                <Link
                  href="/login"
                  className="text-xs text-[#003399] hover:underline font-semibold"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick 1-Click Demo Login */}
          <div className="mt-5 pt-5 border-t border-[#DFDFDF]">
            <div className="flex items-center justify-between text-xs text-[#767676] mb-2 font-medium">
              <span>WANT TO TRY FIRST?</span>
              <span className="font-mono text-[11px] text-[#003399]">demo@paniund.com</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full h-11 bg-[#FFDA1A] hover:bg-[#FFE552] text-[#111111] font-bold text-sm rounded-[4px] border border-[#111111]/20 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                  <span>Loading Demo...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-[#003399]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  <span>Try Demo Account (Alex Morgan)</span>
                </>
              )}
            </button>
          </div>

          {/* Alternative Onboarding Prompt */}
          <div className="mt-8 pt-6 border-t border-[#DFDFDF] text-center text-xs text-[#484848]">
            <span>Want to scan your resume first? </span>
            <Link
              href="/"
              className="font-bold text-[#003399] hover:underline"
            >
              Upload on home page
            </Link>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="border-t border-[#DFDFDF] bg-[#F5F5F5] px-6 py-2.5 flex items-center justify-between text-xs text-[#767676]">
          <span>Secure Sign In</span>
          <span className="font-semibold text-[#0A8A00] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0A8A00] inline-block" />
            Online
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginContent />
    </SessionProvider>
  );
}
