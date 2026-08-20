import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AutonomousAgentCockpit } from "@/components/agents/AutonomousAgentCockpit";

export const metadata = {
  title: "Autonomous Agent Swarm & Market Intelligence | Paniund",
  description:
    "Deploy 24/7 background AI agents to autonomously scan multi-board job feeds, synthesize tailored application packets, and track live market salary surges.",
};

export default async function AutonomousAgentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">Autonomous Agent Swarm</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>Autonomous Agent Swarm & Market Radar</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Your personal 24/7 AI career team. Hunter Agent continuously scans 140k+ listings, tailors resume bullet points, and generates cold outreach notes while Radar Agent monitors real-time compensation surges.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Swarm Daemon Running
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Cockpit */}
      <AutonomousAgentCockpit />
    </div>
  );
}
