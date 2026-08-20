import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Live WebRTC Interview Rooms & Copilot | Paniund",
  description:
    "Conduct live 1-on-1 technical and behavioral interviews with synchronized coding sandboxes, collaborative scorecards, and a real-time AI fact-checking copilot.",
};

export default async function InterviewRoomsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const SAMPLE_ROOMS = [
    {
      id: "tech-round-402",
      title: "Senior Backend Systems Round",
      targetRole: "Staff Software Engineer",
      candidateName: "Sarah Miller",
      scheduledTime: "Today at 2:00 PM",
      status: "ready",
    },
    {
      id: "arch-round-819",
      title: "Distributed Architecture & Scalability",
      targetRole: "Principal Systems Architect",
      candidateName: "David Chen",
      scheduledTime: "Tomorrow at 10:30 AM",
      status: "scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">WebRTC Video Interview Rooms</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>HD Video Interview Rooms with AI Copilot</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Conduct high-fidelity peer-to-peer video interviews with candidates. Includes live synchronized code pads, private AI fact-checking copilot, and instant scorecard syncing.
            </p>
          </div>

          <Link
            href="/interview-room/quick-start-room"
            className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span>+</span>
            <span>Launch Instant HD Video Room &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-2xl">📹</div>
          <h3 className="text-sm font-black text-black">Peer-to-Peer HD WebRTC</h3>
          <p className="text-xs text-zinc-600">
            Ultra-low latency audio/video with screen sharing directly in the browser with zero downloads.
          </p>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-2xl">🤖</div>
          <h3 className="text-sm font-black text-black">Private AI Fact-Checker</h3>
          <p className="text-xs text-zinc-600">
            Real-time fact checking and high-signal follow-up probe generation visible only to the interviewer.
          </p>
        </div>

        <div className="p-6 bg-white border border-zinc-200 rounded-3xl space-y-2 shadow-sm">
          <div className="text-2xl">📋</div>
          <h3 className="text-sm font-black text-black">Synchronized Code & ATS Sync</h3>
          <p className="text-xs text-zinc-600">
            Live multi-language code execution and 1-click scorecard rating exports back to your candidate pipeline.
          </p>
        </div>
      </div>

      {/* Active & Scheduled Rooms List */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="pb-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-black">Scheduled Video Interview Rooms</h3>
            <p className="text-xs text-zinc-600">
              Join active rounds or dispatch candidate invitation links.
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-200">
          {SAMPLE_ROOMS.map((room) => (
            <div
              key={room.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 p-3 rounded-2xl transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-sm font-black text-black">{room.title}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span>Candidate: <strong className="text-black">{room.candidateName}</strong></span>
                  <span>•</span>
                  <span>{room.targetRole}</span>
                  <span>•</span>
                  <span className="font-mono text-zinc-500">{room.scheduledTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/interview-room/${room.id}`}
                  className="touch-target px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Enter Room</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
