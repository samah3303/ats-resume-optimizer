"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { StepByStepTileNavigator } from "@/components/tiles/StepByStepTileNavigator";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 pb-28 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Strictly 2-Tile Workspace Navigator (Mobile-First) */}
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
