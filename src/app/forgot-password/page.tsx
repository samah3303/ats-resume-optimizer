"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSubmitted(true);
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4 py-12 selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" className="mb-8" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-[#DFDFDF] rounded-[4px] shadow-sm overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-[#003399] w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-[#484848] mt-1">
              Enter your account email address and we will dispatch password recovery instructions.
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

          {submitted ? (
            <div className="space-y-5">
              <div className="border border-[#0A8A00] bg-[#0A8A00]/10 text-[#0A8A00] p-4 rounded-[4px] text-xs font-semibold space-y-1">
                <p className="font-bold text-sm">✓ Request Received</p>
                <p className="text-[#111111] font-normal leading-relaxed">
                  If an account is associated with <span className="font-bold">{email}</span>, a secure password reset link has been dispatched. The link remains valid for 1 hour.
                </p>
              </div>

              {/* Dev mode instant testing shortcut */}
              {devResetUrl && (
                <div className="border border-[#FFDA1A] bg-[#FFDA1A]/15 p-3.5 rounded-[4px] text-xs space-y-2">
                  <span className="font-bold text-[#111111] uppercase tracking-wider text-[10px] block">
                    Developer Quick Link (Dev Mode)
                  </span>
                  <p className="text-[11px] text-[#484848]">
                    Click below to open the reset page directly:
                  </p>
                  <Link
                    href={devResetUrl}
                    className="nordic-btn-yellow h-8 px-3 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    Open Reset Page ➔
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/login"
                  className="nordic-btn-outline w-full h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50 tap-active"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-3 border-t border-[#DFDFDF] mt-4">
                <Link
                  href="/login"
                  className="text-xs text-[#003399] font-semibold hover:underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
