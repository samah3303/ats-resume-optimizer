import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VideoAnalyticsDashboard } from "@/components/video/VideoAnalyticsDashboard";

export const metadata = {
  title: "Multi-Modal Video Emotion & Confidence Analytics | KYRO AI",
  description:
    "Real-time webcam computer vision telemetry measuring eye contact directness, posture stability, micro-expression confidence, and executive presence.",
};

export default async function VideoAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">Video Emotion & Composure Analytics</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>Multi-Modal Video Emotion & Composure Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Master your on-camera executive presence. In-browser computer vision telemetry tracks eye contact directness, head pose stability, and facial micro-expressions in real time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Computer Vision HUD Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Dashboard */}
      <VideoAnalyticsDashboard />
    </div>
  );
}
