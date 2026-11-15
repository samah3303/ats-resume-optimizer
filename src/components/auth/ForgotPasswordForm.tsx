"use client";

import { useState } from "react";
import Link from "next/link";
import Toast from "@/components/ui/Toast";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      setToastMessage("If an account exists with that email, we've sent a reset link.");
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

      {submitted ? (
        <div className="space-y-5">
          <div className="border border-nordic-success bg-nordic-success/10 text-nordic-success p-4 rounded-[4px] text-xs font-semibold space-y-1">
            <p className="font-bold text-sm">✓ Request Received</p>
            <p className="text-nordic-text font-normal leading-relaxed">
              If an account is associated with{" "}
              <span className="font-bold">{email}</span>, a secure password reset link
              has been dispatched. The link remains valid for 1 hour.
            </p>
          </div>

          {/* Dev mode instant testing shortcut */}
          {devResetUrl && (
            <div className="border border-nordic-secondary bg-nordic-secondary/15 p-3.5 rounded-[4px] text-xs space-y-2">
              <span className="font-bold text-nordic-text uppercase tracking-wider text-[10px] block">
                Developer Quick Link (Dev Mode)
              </span>
              <p className="text-[11px] text-nordic-text-secondary">
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
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50 tap-active"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center pt-3 border-t border-nordic-border mt-4">
            <Link
              href="/login"
              className="text-xs text-nordic-primary font-semibold hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}

      {/* Success Toast */}
      <Toast
        message={toastMessage}
        type="success"
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
