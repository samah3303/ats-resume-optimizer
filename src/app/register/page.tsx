"use client";

import { useState, type FormEvent, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#09090B] text-[#FAFAFA]">
      <div className="w-full max-w-5xl bg-[#18181B] border border-[#27272A] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT PANEL: Interactive Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
          {/* Header & Logo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              {/* Segmented Auth Mode Switcher */}
              <div className="flex items-center p-1 bg-[#09090B] border border-[#27272A] rounded-2xl text-[11px] font-bold">
                <Link
                  href="/login"
                  className="px-3.5 py-1 text-zinc-400 hover:text-[#FAFAFA] rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  className="px-3.5 py-1 bg-[#FAFAFA] text-[#09090B] rounded-xl font-bold"
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                FREE ACCOUNT ACCESS
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] tracking-tight mt-1.5">
                Create your paniund account
              </h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Join engineers landing top roles with AI resume optimization and talent operating intelligence.
              </p>
            </div>
          </div>

          {/* Social OAuth Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading !== null || loading}
                className="touch-target py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{socialLoading === "google" ? "Connecting..." : "Google"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={socialLoading !== null || loading}
                className="touch-target py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] text-white text-xs font-bold rounded-xl transition-all border border-[#27272A] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>{socialLoading === "github" ? "Connecting..." : "GitHub"}</span>
              </button>
            </div>

            {/* Robust Horizontal Divider */}
            <div className="flex items-center gap-3 my-2 w-full">
              <div className="h-[1px] bg-[#27272A] flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 whitespace-nowrap shrink-0 select-none">
                or sign up with email
              </span>
              <div className="h-[1px] bg-[#27272A] flex-1" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-bold animate-in fade-in">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-zinc-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                placeholder="Alex Rivers"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-zinc-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                placeholder="alex.rivers@engineering.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-zinc-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-bold text-zinc-400 hover:text-[#FAFAFA] cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="Min. 6 chars"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-zinc-300 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Security Strength:</span>
                  <span className="font-bold text-[#FAFAFA]">
                    {passStrength <= 1 && "Weak"}
                    {passStrength === 2 && "Fair"}
                    {passStrength === 3 && "Strong"}
                    {passStrength === 4 && "Bulletproof 🛡️"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all ${
                        passStrength >= step ? "bg-[#FAFAFA]" : "bg-[#27272A]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="touch-target w-full py-3.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-[#FAFAFA] mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Free paniund Account &rarr;</span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-[11px] text-zinc-400 pt-2 border-t border-[#27272A]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FAFAFA] font-bold hover:underline ml-1"
            >
              Sign in &rarr;
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL: Luxury Showcase & Social Proof */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#09090B] text-[#FAFAFA] p-10 flex-col justify-between relative overflow-hidden border-l border-[#27272A]">
          {/* Top Badge */}
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] font-bold uppercase text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA] animate-pulse" />
              100% Free Candidate Suite
            </div>

            <h3 className="text-xl font-bold tracking-tight leading-snug text-[#FAFAFA]">
              Built for High-Velocity Engineering &amp; Career Growth
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock 6 ATS-compliant resume templates, Monaco coding sandboxes, and conversational voice mocks with zero paywalls.
            </p>
          </div>

          {/* Feature Highlight Bento */}
          <div className="space-y-2.5 relative z-10">
            {[
              { icon: "📄", title: "6 Pro ATS Templates", desc: "Pixel-perfect A4 print styles with inline STAR diffs" },
              { icon: "💻", title: "Monaco Coding IDE", desc: "Automated test assertions with Two-Pointer visualizer" },
              { icon: "🎙️", title: "Spoken Voice Mock Coach", desc: "8 interview personas with 48-bar audio waveforms" },
            ].map((f, idx) => (
              <div key={idx} className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-[#FAFAFA]">{f.title}</h4>
                  <p className="text-[10px] text-zinc-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Security Note */}
          <div className="pt-4 border-t border-[#27272A] text-[10px] text-zinc-500 font-mono flex items-center justify-between relative z-10">
            <span>🔒 Enterprise Grade Encryption</span>
            <span>GDPR / CCPA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
