import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — paniund",
  description: "Sign in to view your resume score, matched jobs, and applications.",
};

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 w-24 bg-nordic-border/60 rounded mb-1.5" />
        <div className="h-11 w-full bg-nordic-border/40 rounded" />
      </div>
      <div>
        <div className="h-4 w-20 bg-nordic-border/60 rounded mb-1.5" />
        <div className="h-11 w-full bg-nordic-border/40 rounded" />
      </div>
      <div className="h-11 w-full bg-nordic-primary/30 rounded mt-2" />
    </div>
  );
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text font-sans">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" className="mb-8" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
        {/* Top Brand Accent Bar */}
        <div className="h-1.5 bg-nordic-primary w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-nordic-text-secondary mt-1">
              Sign in to view your resume score, matched jobs, and applications.
            </p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Card Footer: No Account Help */}
        <div className="px-8 py-4 bg-nordic-bg border-t border-nordic-border text-center text-xs text-nordic-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/#dropzone"
            className="text-nordic-primary font-bold hover:underline"
          >
            Upload your resume on the home page
          </Link>{" "}
          to create one instantly.
        </div>
      </div>

      {/* Support / Help Links */}
      <div className="mt-8 flex items-center gap-4 text-xs text-nordic-neutral font-medium">
        <Link href="/" className="hover:text-nordic-primary transition-colors">
          ← Back to Overview
        </Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-nordic-primary transition-colors">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link href="/pricing" className="hover:text-nordic-primary transition-colors">
          Pricing
        </Link>
      </div>
    </div>
  );
}
