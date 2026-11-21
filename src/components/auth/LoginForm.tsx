"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "success";
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
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
    <div>
      {isResetSuccess && (
        <div className="mb-6 border border-nordic-success bg-nordic-success/10 text-nordic-success p-3 rounded-[4px] text-xs font-semibold flex items-center gap-2">
          <span className="font-bold">✓</span>
          <span>
            Your password has been successfully updated! Please sign in with your new credentials.
          </span>
        </div>
      )}

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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-nordic-primary hover:underline font-semibold"
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
            className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In to Workspace"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-nordic-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-nordic-text-secondary font-semibold">
              Instant Access
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="nordic-btn-yellow w-full h-11 text-sm font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {demoLoading ? (
            "Authenticating..."
          ) : (
            <>
              <span>⚡</span>
              <span>Explore Demo Workspace</span>
            </>
          )}
        </button>

        <div className="pt-4 border-t border-nordic-border text-center mt-4">
          <p className="text-xs text-nordic-text-secondary">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-nordic-primary font-bold hover:underline"
            >
              Create free profile &rarr;
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
