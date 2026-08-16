import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const body = await req.json();
    const { applicationId, stage, overallScore, criteria, feedback, recommendation } = body;

    if (!applicationId || overallScore === undefined) {
      return NextResponse.json(
        { error: "applicationId and overallScore are required" },
        { status: 400 }
      );
    }

    const scorecard = await prisma.candidateScorecard.create({
      data: {
        applicationId,
        reviewerId: userId,
        stage: stage || "live_interview",
        overallScore: Math.min(100, Math.max(1, parseInt(overallScore, 10))),
        criteriaJson: JSON.stringify(criteria || {}),
        feedback: feedback?.trim() || "No feedback provided.",
        recommendation: recommendation || "hire",
      },
      include: {
        reviewer: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      scorecard: {
        id: scorecard.id,
        stage: scorecard.stage,
        overallScore: scorecard.overallScore,
        criteria: JSON.parse(scorecard.criteriaJson),
        feedback: scorecard.feedback,
        recommendation: scorecard.recommendation,
        reviewerName: scorecard.reviewer.name || scorecard.reviewer.email,
        createdAt: scorecard.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating candidate scorecard:", err);
    return NextResponse.json(
      { error: "Failed to submit candidate scorecard" },
      { status: 500 }
    );
  }
}
