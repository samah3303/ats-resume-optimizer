import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Profile — paniund",
  description: "Create your free candidate profile, track applications, and optimize your resume.",
};

function RegisterFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-4 w-20 bg-nordic-border/60 rounded mb-1.5" />
        <div className="h-11 w-full bg-nordic-border/40 rounded" />
      </div>
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

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text font-sans">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" className="mb-8" />

      {/* Register Card */}
      <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
        {/* Top Brand Accent Bar */}
        <div className="h-1.5 bg-nordic-secondary w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
              Create Candidate Profile
            </h1>
            <p className="text-sm text-nordic-text-secondary mt-1">
              Start free. Track jobs, scan ATS keywords, and tailor application materials.
            </p>
          </div>

          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs font-semibold text-nordic-text-secondary hover:text-nordic-primary transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
