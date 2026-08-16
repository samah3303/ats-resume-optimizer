import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const body = await req.json();
    const applicationId = body.applicationId || body.candidateApplicationId;
    const stage = body.stage;

    if (!applicationId || !stage) {
      return NextResponse.json(
        { error: "applicationId and stage are required" },
        { status: 400 }
      );
    }

    const validStages = [
      "applied",
      "screened",
      "coding",
      "ai_interview",
      "live_interview",
      "offer",
      "hired",
      "rejected",
    ];

    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${validStages.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedCandidate = await prisma.candidateApplication.update({
      where: {
        id: applicationId,
        jobPostingId,
      },
      data: {
        stage,
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        ...updatedCandidate,
        matchedSkills: updatedCandidate.matchedSkills
          ? JSON.parse(updatedCandidate.matchedSkills)
          : [],
        missingSkills: updatedCandidate.missingSkills
          ? JSON.parse(updatedCandidate.missingSkills)
          : [],
      },
    });
  } catch (err) {
    console.error("Error updating candidate stage:", err);
    return NextResponse.json(
      { error: "Failed to update candidate stage" },
      { status: 500 }
    );
  }
}
