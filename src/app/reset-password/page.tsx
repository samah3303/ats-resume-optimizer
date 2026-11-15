import { Suspense } from "react";
import Logo from "@/components/Logo";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Create New Password — paniund",
  description: "Set a new secure password for your paniund account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text font-sans">
      <Logo size="lg" theme="on-light" className="mb-8" />
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white p-8 rounded-[4px] border border-nordic-border text-center text-xs text-nordic-neutral">
            Loading reset verification...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
