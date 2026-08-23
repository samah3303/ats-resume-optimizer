"use client";

import { useState, type FormEvent, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useWorkspaceMode, WorkspaceMode } from "@/components/WorkspaceModeContext";

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMode } = useWorkspaceMode();

  const [role, setRole] = useState<WorkspaceMode>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const target = role === "recruiter" ? "/dashboard/recruiter" : "/";
      router.replace(target);
    }
  }, [status, router, role]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback" || errorParam === "Configuration") {
        setError("Google OAuth not yet configured. Please set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in environment variables.");
      } else if (errorParam === "AccessDenied") {
        setError("Access was denied by Google.");
      } else {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "CredentialsSignin"
          ? "Invalid email or password. Please check your credentials."
          : result.error
      );
    } else if (result?.ok) {
      localStorage.setItem("paniund_workspace_mode", role);
      localStorage.setItem("kyro_workspace_mode", role);
      setMode(role);
      const target = role === "recruiter" ? "/dashboard/recruiter" : "/";
      router.push(target);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    setError("");
    setSocialLoading(provider);
    localStorage.setItem("paniund_workspace_mode", role);
    localStorage.setItem("kyro_workspace_mode", role);
    const callbackUrl = role === "recruiter" ? "/dashboard/recruiter" : "/";
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError("Failed to initiate Google login. Check your OAuth configuration.");
      setSocialLoading(null);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-[#09090B] text-[#FAFAFA]">
      <div className="w-full max-w-5xl bg-[#18181B] border border-[#27272A] rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* LEFT PANEL: Interactive Authentication Form */}
        <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 sm:space-y-5">
          {/* Header & Logo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              {/* Segmented Auth Mode Switcher */}
              <div className="flex items-center p-1 bg-[#09090B] border border-[#27272A] rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  className="px-3 py-1 bg-[#FAFAFA] text-[#09090B] rounded-xl font-bold"
                >
                  Sign In
                </button>
                <Link
                  href="/register"
                  className="px-3 py-1 text-zinc-400 hover:text-[#FAFAFA] rounded-xl transition-all"
                >
                  Sign Up
                </Link>
              </div>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                AUTHENTICATED ACCESS
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FAFAFA] tracking-tight mt-1">
                Welcome back to paniund
              </h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Sign in to your personalized talent operating system.
              </p>
            </div>

            {/* Segmented Role Selector Toggle */}
            {/*
            <div className="space-y-1 pt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Select Your Role / Workspace
              </span>
              <div className="grid grid-cols-2 p-1 bg-[#09090B] border border-[#27272A] rounded-xl text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`min-h-[36px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                    role === "candidate"
                      ? "bg-[#FAFAFA] text-[#09090B] shadow-xs"
                      : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#18181B]"
                  }`}
                >
                  <span>👤</span>
                  <span>Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`min-h-[36px] py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                    role === "recruiter"
                      ? "bg-[#FAFAFA] text-[#09090B] shadow-xs"
                      : "text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#18181B]"
                  }`}
                >
                  <span>👔</span>
                  <span>Recruiter</span>
                </button>
              </div>
            </div>
            */}
          </div>

          {/* Social OAuth Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null || loading}
              className="touch-target min-h-[42px] sm:min-h-[44px] w-full py-2 sm:py-2.5 px-4 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
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
              <span>
                {socialLoading === "google"
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </span>
            </button>

            {/* Robust Horizontal Divider */}
            <div className="flex items-center gap-3 my-1 w-full">
              <div className="h-[1px] bg-[#27272A] flex-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 whitespace-nowrap shrink-0 select-none">
                or with email
              </span>
              <div className="h-[1px] bg-[#27272A] flex-1" />
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 font-bold animate-in fade-in">
                ⚠️ {error}
              </div>
            )}

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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                placeholder="alex.rivers@example.com"
              />
            </div>

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
                  className="text-[11px] font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none transition-all font-medium"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="touch-target min-h-[42px] sm:min-h-[44px] w-full py-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-[#FAFAFA] mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to paniund &rarr;</span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-[11px] text-zinc-400 pt-1.5 border-t border-[#27272A]">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/register"
              className="text-[#FAFAFA] font-bold hover:underline ml-1"
            >
              Create one free &rarr;
            </Link>
          </p>
        </div>

        {/* RIGHT PANEL: Luxury Showcase & Social Proof */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#09090B] text-[#FAFAFA] p-8 lg:p-10 flex-col justify-between relative overflow-hidden border-l border-[#27272A]">
          {/* Top Badge */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-[#27272A] rounded-full text-[10px] font-bold uppercase text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAFAFA] animate-pulse" />
              Direct Workspace Authentication
            </div>

            <h3 className="text-xl font-bold tracking-tight leading-snug text-[#FAFAFA]">
              {role === "recruiter"
                ? "Recruiter OS: Fast Requisitions, Bulk ATS Screening & Pipelines"
                : "Candidate Suite: ATS Resumes, Voice Mocks & Salary Simulation"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {role === "recruiter"
                ? "Manage end-to-end recruitment pipelines, objective scorecards, and live technical rooms without friction."
                : "Accelerate your career journey with ATS-verified resumes, coding sandboxes, spoken audio mocks, and equity calculators."}
            </p>
          </div>

          {/* Testimonial Quote Card */}
          <div className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-2.5 relative z-10">
            <div className="flex items-center gap-1 text-zinc-300 text-xs">
              {"★".repeat(5)}
            </div>
            <p className="text-xs text-zinc-300 italic font-medium leading-relaxed">
              {role === "recruiter"
                ? "“The 15-second Job Architect and bulk resume screener reduced our initial review cycle from days to minutes.”"
                : "“The STAR diff rewriter transformed my resume bullets and helped me land 3 offers in my first month.”"}
            </p>
            <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px]">
              <span className="font-bold text-[#FAFAFA]">
                {role === "recruiter" ? "Elena Rostova" : "Sarah Jenkins"}
              </span>
              <span className="text-zinc-500 font-mono">
                {role === "recruiter" ? "VP Talent • FinTech" : "Staff Lead"}
              </span>
            </div>
          </div>

          {/* Metric Telemetry Tickers */}
          <div className="grid grid-cols-2 gap-3 relative z-10 pt-3 border-t border-[#27272A] text-xs">
            <div>
              <div className="text-lg font-bold font-mono text-[#FAFAFA]">
                {role === "recruiter" ? "15s" : "98.4%"}
              </div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">
                {role === "recruiter" ? "JD Gen Time" : "ATS Pass Rate"}
              </span>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-[#FAFAFA]">
                {role === "recruiter" ? "8-Stage" : "140k+"}
              </div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">
                {role === "recruiter" ? "Kanban Pipeline" : "Matched Jobs"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#09090B]">
          <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
