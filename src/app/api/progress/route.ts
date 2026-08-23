import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const primaryResume = await prisma.resume.findFirst({
      where: { userId, isPrimary: true },
    });
    const hasPrimaryResume = !!primaryResume;

    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });
    const hasLinkedin = !!(profile?.linkedinOpts && profile.linkedinOpts.length > 5);

    const roadmap = await prisma.roadmap.findFirst({
      where: { userId },
    });
    const hasRoadmap = !!roadmap;

    const applications = await prisma.candidateApplication.findMany({
      where: { candidateId: userId },
      select: { stage: true },
    });

    const hasInterview = applications.some((app) => 
      ["interviewing", "ai_interview", "live_interview", "interview"].includes(app.stage.toLowerCase())
    );

    const hasOffer = applications.some((app) => 
      ["offer", "hired"].includes(app.stage.toLowerCase())
    );

    const latestAnalysis = await prisma.analysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      hasPrimaryResume,
      hasLinkedin,
      hasRoadmap,
      hasInterview,
      hasOffer,
      generalAtsScore: profile?.generalAtsScore || null,
      latestAnalysisId: latestAnalysis?.id || null,
      latestAnalysisScore: latestAnalysis?.overallScore || null,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progression state" },
      { status: 500 }
    );
  }
}
