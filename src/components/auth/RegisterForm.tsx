"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account. Please try again.");
      }

      // Automatically sign in the candidate
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInRes?.error) {
        router.push(`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Jenkins"
            className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@example.com"
            className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Password (min. 6 characters)
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="nordic-btn-yellow w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50 uppercase"
        >
          {loading ? "Creating Profile..." : "Create Free Profile →"}
        </button>

        <p className="text-[11px] text-nordic-neutral text-center mt-3">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-nordic-text">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-nordic-text">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="pt-4 border-t border-nordic-border text-center">
          <p className="text-xs text-nordic-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-nordic-primary font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
