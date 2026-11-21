"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SetupPasswordForm() {
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
    <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
      {/* Accent Bar */}
      <div className="h-1.5 bg-nordic-secondary w-full" />

      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
            Create Password
          </h1>
          <p className="text-sm text-nordic-text-secondary mt-1">
            Resume parsed successfully for{" "}
            <span className="font-semibold text-nordic-text">{email || "candidate"}</span>. Set your account password to continue.
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
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-3.5 bg-nordic-bg border border-nordic-border rounded-[4px] text-sm text-nordic-text font-medium opacity-90 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Set Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
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

      <div className="border-t border-nordic-border bg-nordic-bg px-6 py-2.5 flex items-center justify-between text-xs text-nordic-neutral">
        <span>Step 1 of 2</span>
        <span className="font-semibold text-nordic-primary">Account Security</span>
      </div>
    </div>
  );
}
