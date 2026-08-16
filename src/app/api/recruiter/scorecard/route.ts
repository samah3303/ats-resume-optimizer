import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId query parameter is required." },
        { status: 400 }
      );
    }

    const scorecards = await prisma.candidateScorecard.findMany({
      where: {
        applicationId,
        application: {
          jobPosting: {
            userId: session.user.id,
          },
        },
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      scorecards,
    });
  } catch (error) {
    console.error("Failed to fetch scorecards:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate scorecards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      applicationId,
      stage,
      overallScore,
      criteriaJson,
      criteria,
      feedback,
      recommendation,
    } = body;

    if (!applicationId || typeof applicationId !== "string") {
      return NextResponse.json(
        { error: "applicationId is required." },
        { status: 400 }
      );
    }

    if (overallScore === undefined || overallScore === null || isNaN(Number(overallScore))) {
      return NextResponse.json(
        { error: "Valid overallScore (0-100) is required." },
        { status: 400 }
      );
    }

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json(
        { error: "Feedback notes are required." },
        { status: 400 }
      );
    }

    // Verify application exists and recruiter has access
    const application = await prisma.candidateApplication.findFirst({
      where: {
        id: applicationId,
        jobPosting: {
          userId: session.user.id,
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Candidate application not found or unauthorized." },
        { status: 404 }
      );
    }

    let parsedCriteriaJson = "{}";
    if (typeof criteriaJson === "string" && criteriaJson.trim()) {
      parsedCriteriaJson = criteriaJson.trim();
    } else if (criteria && typeof criteria === "object") {
      parsedCriteriaJson = JSON.stringify(criteria);
    }

    const validRecommendations = ["strong_hire", "hire", "hold", "reject"];
    const parsedRecommendation = validRecommendations.includes(recommendation)
      ? recommendation
      : "hire";

    const score = Math.max(0, Math.min(100, Math.round(Number(overallScore))));

    const scorecard = await prisma.candidateScorecard.create({
      data: {
        applicationId,
        reviewerId: session.user.id,
        stage: stage || application.stage || "screened",
        overallScore: score,
        criteriaJson: parsedCriteriaJson,
        feedback: feedback.trim(),
        recommendation: parsedRecommendation,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        scorecard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create candidate scorecard:", error);
    return NextResponse.json(
      { error: "Failed to create candidate scorecard" },
      { status: 500 }
    );
  }
}
