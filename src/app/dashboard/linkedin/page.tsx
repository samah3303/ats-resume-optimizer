import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LinkedInOptimizer } from "@/components/linkedin/LinkedInOptimizer";
import { OutreachSequenceBuilder } from "@/components/linkedin/OutreachSequenceBuilder";
import { ProfileChecklist } from "@/components/linkedin/ProfileChecklist";

export const metadata = {
  title: "LinkedIn Brand Optimizer & Outreach Suite | OmniJob AI",
  description: "AI-powered LinkedIn profile rewriter, top 50 ranked skills for recruiter SEO, and 3-step cold outreach sequence generator.",
};

export default async function LinkedInPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  // Fetch user's resumes for easy selector
  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: { id: true, name: true, parsedText: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const primaryResume = resumes[0];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Breadcrumb & Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-[#FAFAFA]">LinkedIn Brand & Outreach</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#FAFAFA] tracking-tight flex items-center gap-3">
              <span>LinkedIn Brand & Outreach Suite</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl mt-1.5 leading-relaxed">
              Transform your LinkedIn profile into a recruiter magnet with keyword-indexed headlines, high-engagement story summaries, and 3-step personalized cold outreach sequences.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-[#27272A] border border-[#27272A] text-[#FAFAFA] text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-black" />
              {resumes.length} Resumes Linked
            </span>
          </div>
        </div>
      </div>

      {/* Main Suite Container */}
      <div className="space-y-8">
        {/* Module 1: Profile Optimizer */}
        <LinkedInOptimizer
          resumes={resumes.map((r) => ({ id: r.id, name: r.name }))}
          defaultRole={primaryResume ? primaryResume.name.replace(/\.[^/.]+$/, "") : "Senior Software Engineer"}
        />

        {/* Module 2: Cold Outreach Sequence Generator */}
        <OutreachSequenceBuilder
          defaultCandidateName={session.user.name || "Candidate"}
        />

        {/* Module 3: Profile Audit & SEO Checklist */}
        <ProfileChecklist />
      </div>
    </div>
  );
}
