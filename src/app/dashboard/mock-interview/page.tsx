import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MockInterviewCockpit } from "@/components/interview/MockInterviewCockpit";

export const metadata = {
  title: "AI Conversational Voice Mock Interviewer | OmniJob AI",
  description: "Practice real-time spoken mock interviews with AI persona interviewers across Recruiter Screen, Technical Architecture, STAR Behavioral, and System Design.",
};

export default async function MockInterviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">Voice Mock Interview Room</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>AI Conversational Voice Mock Interviewer</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Experience realistic spoken mock interviews with live speech-to-text recognition, natural audio voice synthesis, real-time STAR coaching, and comprehensive diagnostic scorecards.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              8 Interview Personas
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Cockpit */}
      <MockInterviewCockpit
        resumes={resumes.map((r) => ({ id: r.id, name: r.name }))}
      />
    </div>
  );
}
