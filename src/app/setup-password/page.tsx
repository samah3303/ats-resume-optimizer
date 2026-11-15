import { Suspense } from "react";
import Logo from "@/components/Logo";
import SetupPasswordForm from "@/components/auth/SetupPasswordForm";

export const metadata = {
  title: "Create Password — paniund",
  description: "Set your password to complete your account setup.",
};

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text font-sans">
      <Logo size="lg" theme="on-light" subtitle="Account Onboarding" className="mb-8" />
      <Suspense
        fallback={
          <div className="min-h-[300px] flex items-center justify-center bg-white border border-nordic-border rounded-[4px] p-8 text-sm font-semibold text-nordic-text-secondary">
            Loading...
          </div>
        }
      >
        <SetupPasswordForm />
      </Suspense>
    </div>
  );
}
