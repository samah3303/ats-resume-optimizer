"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudioPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-bold text-black">
        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to Dashboard...</span>
      </div>
    </div>
  );
}
