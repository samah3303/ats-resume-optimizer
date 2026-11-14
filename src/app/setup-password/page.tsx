"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Logo from "@/components/Logo";

function SetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const userId = searchParams.get("userId") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password requirement: Must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password mismatch: Please ensure both password fields match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Password setup failed.");
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/complete-profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password setup failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4 py-12 selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" subtitle="Account Onboarding" className="mb-8" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm overflow-hidden">
        {/* Accent Bar */}
        <div className="h-1.5 bg-[#FFDA1A] w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Create Password
            </h1>
            <p className="text-sm text-[#484848] mt-1">
              Resume parsed successfully for{" "}
              <span className="font-semibold text-[#111111]">{email || "candidate"}</span>. Set your account password to continue.
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
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Setting up account..." : "Continue to Profile"}
            </button>
          </form>
        </div>

        <div className="border-t border-[#DFDFDF] bg-[#F5F5F5] px-6 py-2.5 flex items-center justify-between text-xs text-[#767676]">
          <span>Step 1 of 2</span>
          <span className="font-semibold text-[#003399]">Account Security</span>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-sm font-semibold text-[#484848]">Loading...</div>}>
      <SetupPasswordContent />
    </Suspense>
  );
}
