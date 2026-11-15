import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset Password — paniund",
  description: "Request a password reset link for your paniund account.",
};

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text font-sans">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" className="mb-8" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
        {/* Top Accent Bar */}
        <div className="h-1.5 bg-nordic-primary w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-nordic-text-secondary mt-1">
              Enter your account email address and we will dispatch password recovery instructions.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="mt-8 text-xs text-nordic-neutral font-medium">
        <Link href="/" className="hover:text-nordic-primary transition-colors">
          ← Back to Overview
        </Link>
      </div>
    </div>
  );
}
