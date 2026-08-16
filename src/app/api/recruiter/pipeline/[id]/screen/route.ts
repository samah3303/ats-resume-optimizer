import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screenCandidateResume } from "@/lib/ai/recruiter-screening";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobPostingId } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
      include: {
        applications: true,
      },
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const candidateId = body.candidateId || body.applicationId;

    let targetsToScreen = job.applications;
    if (candidateId) {
      targetsToScreen = job.applications.filter((a) => a.id === candidateId);
    }

    if (targetsToScreen.length === 0) {
      return NextResponse.json(
        { error: "No candidate applications found to screen." },
        { status: 400 }
      );
    }

    const results = [];

    for (const app of targetsToScreen) {
      const screening = await screenCandidateResume({
        candidateName: app.candidateName,
        resumeText: app.resumeText || "No resume text available",
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.requirements,
      });

      // Update in database
      const updated = await prisma.candidateApplication.update({
        where: { id: app.id },
        data: {
          fitScore: screening.fitScore,
          fitSummary: screening.fitSummary,
          matchedSkills: JSON.stringify(screening.matchedSkills),
          missingSkills: JSON.stringify(screening.missingSkills),
          // Auto move from "applied" to "screened" if currently "applied"
          stage: app.stage === "applied" ? "screened" : app.stage,
        },
      });

      results.push({
        id: updated.id,
        candidateName: updated.candidateName,
        fitScore: screening.fitScore,
        fitSummary: screening.fitSummary,
        matchedSkills: screening.matchedSkills,
        missingSkills: screening.missingSkills,
        recommendation: screening.recommendation,
        stage: updated.stage,
      });
    }

    return NextResponse.json({
      success: true,
      screenedCount: results.length,
      results,
    });
  } catch (err) {
    console.error("Error screening candidates:", err);
    return NextResponse.json(
      { error: "Failed to perform AI ATS screening." },
      { status: 500 }
    );
  }
}
