"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      // Redirect to login with reset=success query param
      router.push("/login?reset=success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-nordic-error/10 text-nordic-error mx-auto flex items-center justify-center font-bold text-xl">
          ✕
        </div>
        <h1 className="text-xl font-bold text-nordic-text">Invalid Reset Link</h1>
        <p className="text-xs text-nordic-text-secondary leading-relaxed">
          This password reset link is invalid or has expired. Please request a new recovery link.
        </p>
        <Link
          href="/forgot-password"
          className="nordic-btn-primary w-full h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center mt-2"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
      {/* Top Accent Bar */}
      <div className="h-1.5 bg-nordic-secondary w-full" />

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
            Create New Password
          </h1>
          <p className="text-sm text-nordic-text-secondary mt-1">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-nordic-error bg-nordic-error/10 text-nordic-error p-3 rounded-[4px] text-xs font-semibold flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50 tap-active"
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
