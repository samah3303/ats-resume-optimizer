"use client";

import { useState, type FormEvent, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

function RegisterForm() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

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
        body: JSON.stringify({ name, email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
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

  const handleSocialLogin = async (provider: "google") => {
    setError("");
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch {
      setError("Failed to initiate Google registration. Check your OAuth configuration.");
      setSocialLoading(null);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] h-full flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#09090B] text-[#FAFAFA] overflow-y-auto sm:overflow-hidden">
      <div className="w-full max-w-5xl bg-[#18181B] border border-[#27272A] rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT PANEL: Interactive Registration Form (Reduced mobile box padding) */}
        <div className="lg:col-span-7 p-4 sm:p-8 lg:p-12 flex flex-col justify-between space-y-3 sm:space-y-4">
          {/* Header & Logo */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              {/* Segmented Auth Mode Switcher */}
              <div className="flex items-center p-0.5 sm:p-1 bg-[#09090B] border border-[#27272A] rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-zinc-400 hover:text-[#FAFAFA] rounded-lg sm:rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-[#FAFAFA] text-[#09090B] rounded-lg sm:rounded-xl font-bold"
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div>
              <span className="px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                FREE ACCOUNT ACCESS
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FAFAFA] tracking-tight mt-0.5">
                Create your paniund account
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium">
                Join ambitious professionals landing top roles with AI career intelligence.
              </p>
            </div>
          </div>

          {/* Social OAuth Button */}
          <div className="space-y-2 sm:space-y-2.5">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null || loading}
              className="touch-target min-h-[40px] sm:min-h-[44px] w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{socialLoading === "google" ? "Connecting to Google..." : "Sign up with Google"}</span>
            </button>

            {/* Horizontal Divider */}
            <div className="flex items-center gap-2.5 my-1 w-full">
              <div className="h-[1px] bg-[#27272A] flex-1" />
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-zinc-500 whitespace-nowrap shrink-0 select-none">
                or sign up with email
              </span>
              <div className="h-[1px] bg-[#27272A] flex-1" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5">
            {error && (
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-[11px] sm:text-xs text-rose-300 font-bold animate-in fade-in">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] sm:text-xs font-bold text-zinc-300 mb-0.5"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="Alex Rivers"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-[10px] sm:text-xs font-bold text-zinc-300 mb-0.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="alex.rivers@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label
                    htmlFor="password"
                    className="block text-[10px] sm:text-xs font-bold text-zinc-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[9px] sm:text-[10px] font-bold text-zinc-400 hover:text-[#FAFAFA] cursor-pointer"
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
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="Min. 6 chars"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[10px] sm:text-xs font-bold text-zinc-300 mb-0.5"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-1.5 sm:py-2 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="space-y-0.5 pt-0.5">
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono">
                  <span className="text-zinc-400">Security Strength:</span>
                  <span className="font-bold text-[#FAFAFA]">
                    {passStrength <= 1 && "Weak"}
                    {passStrength === 2 && "Fair"}
                    {passStrength === 3 && "Strong"}
                    {passStrength === 4 && "Bulletproof 🛡️"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 rounded-full transition-all ${
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
              className="touch-target min-h-[40px] sm:min-h-[44px] w-full py-2 sm:py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-[#FAFAFA] mt-1"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Free paniund Account &rarr;</span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-[10px] sm:text-[11px] text-zinc-400 pt-1 border-t border-[#27272A]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#FAFAFA] font-bold hover:underline ml-1"
            >
              Sign In &rarr;
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL: Luxury Showcase & Social Proof */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#09090B] text-[#FAFAFA] p-8 lg:p-10 flex-col justify-between relative overflow-hidden border-l border-[#27272A]">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] font-bold uppercase text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA] animate-pulse" />
              Free Lifetime Starter Access
            </div>

            <h3 className="text-xl font-bold tracking-tight leading-snug text-[#FAFAFA]">
              Build Your Competitive Edge in Modern Career Markets
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Unlock ATS-verified resume builders, live coding challenges, conversational audio mock interviews, and salary negotiation simulators.
            </p>
          </div>

          <div className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-2.5 relative z-10">
            <div className="flex items-center gap-1 text-zinc-300 text-xs">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-zinc-300 italic font-medium leading-relaxed">
              &ldquo;The STAR diff rewriter turned my basic bullet points into metric-rich achievements. Landed multiple interviews in my first week.&rdquo;
            </p>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#FAFAFA]">Alex Rivera</span>
              <span className="text-zinc-500 font-mono">Product Lead</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10 pt-3 border-t border-[#27272A] text-xs">
            <div>
              <div className="text-lg font-bold font-mono text-[#FAFAFA]">3.8x</div>
              <span className="text-[9px] text-zinc-400 uppercase font-bold">More Callbacks</span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAFAFA]">100%</div>
              <span className="text-[9px] text-zinc-400 uppercase font-bold">Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[100dvh] bg-[#09090B]">
          <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
