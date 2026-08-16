import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screenCandidateResume } from "@/lib/ai/recruiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { applicationId, resumeText, jobPostingId } = body;

    if (!jobPostingId || typeof jobPostingId !== "string") {
      return NextResponse.json(
        { error: "jobPostingId is required." },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.findFirst({
      where: {
        id: jobPostingId,
        userId: session.user.id,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job posting not found." },
        { status: 404 }
      );
    }

    let textToScreen = typeof resumeText === "string" ? resumeText.trim() : "";
    let candidateApp = null;

    if (applicationId) {
      candidateApp = await prisma.candidateApplication.findFirst({
        where: {
          id: applicationId,
          jobPostingId,
        },
      });

      if (!candidateApp) {
        return NextResponse.json(
          { error: "Candidate application not found for this job posting." },
          { status: 404 }
        );
      }

      if (!textToScreen && candidateApp.resumeText) {
        textToScreen = candidateApp.resumeText;
      }
    }

    if (!textToScreen) {
      return NextResponse.json(
        { error: "Resume text is required to run ATS auto-screening." },
        { status: 400 }
      );
    }

    const jobRequirementsAndContext = `Title: ${job.title}
Department: ${job.department || "N/A"}
Location: ${job.location}

Job Description:
${job.description}

Requirements:
${job.requirements}`;

    const screenResult = await screenCandidateResume(
      textToScreen,
      job.title,
      jobRequirementsAndContext,
      session.user.id
    );

    let updatedApplication = null;
    if (candidateApp) {
      updatedApplication = await prisma.candidateApplication.update({
        where: { id: candidateApp.id },
        data: {
          fitScore: screenResult.fitScore,
          fitSummary: screenResult.fitSummary,
          matchedSkills: JSON.stringify(screenResult.matchedSkills),
          missingSkills: JSON.stringify(screenResult.missingSkills),
          stage: candidateApp.stage === "applied" ? "screened" : candidateApp.stage,
        },
        include: {
          scorecards: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: screenResult,
      application: updatedApplication,
      fitScore: screenResult.fitScore,
      fitSummary: screenResult.fitSummary,
      matchedSkills: screenResult.matchedSkills,
      missingSkills: screenResult.missingSkills,
      recommendation: screenResult.recommendation,
    });
  } catch (error) {
    console.error("Failed to screen resume with AI:", error);
    return NextResponse.json(
      { error: "Failed to screen resume" },
      { status: 500 }
    );
  }
}
