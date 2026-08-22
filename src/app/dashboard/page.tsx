"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { StepByStepTileNavigator } from "@/components/tiles/StepByStepTileNavigator";
import { useWorkspaceMode } from "@/components/WorkspaceModeContext";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode } = useWorkspaceMode();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && mode === "recruiter") {
      router.replace("/dashboard/recruiter");
    }
  }, [status, mode, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <StepByStepTileNavigator />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh] bg-[#09090B]">
          <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
