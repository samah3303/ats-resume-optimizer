import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  mode1OnboardingAnalysis,
  mode2GenerateRoadmap,
  generateRecommendedPositions,
  generateRecommendedJDs,
} from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { resumeId, targetPositions, targetCountry, linkedinUrl, portfolioUrl, githubUrl, industry, jobType } = body;

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required." },
        { status: 400 }
      );
    }

    const positions = Array.isArray(targetPositions)
      ? targetPositions
      : String(targetPositions)
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);

    if (positions.length === 0) {
      return NextResponse.json(
        { error: "At least one target position is required." },
        { status: 400 }
      );
    }

    if (!targetCountry) {
      return NextResponse.json(
        { error: "targetCountry is required." },
        { status: 400 }
      );
    }

    // Verify resume belongs to user
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    // Check if already completed
    const existing = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Onboarding already completed." },
        { status: 409 }
      );
    }

    // Step 1: Run Mode 1 analysis
    const mode1Result = await mode1OnboardingAnalysis(
      resume.parsedText,
      positions,
      targetCountry,
      linkedinUrl || undefined
    );

    // Step 2: Create onboarding profile
    const profile = await prisma.onboardingProfile.create({
      data: {
        userId,
        resumeId,
        targetPositions: positions.join(", "),
        targetCountry,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
        githubUrl: githubUrl || null,
        industry: industry || null,
        jobType: jobType || null,
        profileSummary: mode1Result.profileSummary,
        coreSkills: JSON.stringify(mode1Result.detectedCoreSkills),
        marketGaps: JSON.stringify(mode1Result.marketGaps),
        aiSuggestions: JSON.stringify(mode1Result.aiSuggestions),
        linkedinOpts: JSON.stringify(mode1Result.linkedinOptimizations),
      },
    });

    // Step 3: Generate roadmap
    const mode2Result = await mode2GenerateRoadmap(
      resume.parsedText,
      mode1Result.detectedCoreSkills,
      mode1Result.marketGaps,
      positions
    );

    const getPhase = (weekNumber: number): string => {
      if (weekNumber <= 2) return "Foundation";
      if (weekNumber <= 5) return "High Velocity";
      return "Conversion";
    };

    // Step 4: Create roadmap with weeks
    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        strategyOverview: mode2Result.strategyOverview,
        weeks: {
          create: mode2Result.weeks.map((w) => ({
            weekNumber: w.weekNumber,
            phase: getPhase(w.weekNumber),
            focusTitle: w.focus,
            tasks: JSON.stringify(w.tasks),
            milestone: w.milestone,
          })),
        },
      },
      include: {
        weeks: { orderBy: { weekNumber: "asc" } },
      },
    });

    // Step 5: Generate recommendations in background (don't block onboarding)
    let recommendedPositions: Awaited<ReturnType<typeof generateRecommendedPositions>> = [];
    let recommendedJDs: Awaited<ReturnType<typeof generateRecommendedJDs>> = [];
    try {
      const coreSkills = mode1Result.detectedCoreSkills;
      [recommendedPositions, recommendedJDs] = await Promise.all([
        generateRecommendedPositions(resume.parsedText, coreSkills, targetCountry),
        generateRecommendedJDs(resume.parsedText, coreSkills, positions, targetCountry),
      ]);

      // Create position profiles from recommendations
      if (recommendedPositions.length > 0) {
        await prisma.positionProfile.createMany({
          data: recommendedPositions.map((p) => ({
            userId,
            title: p.title,
            targetRole: p.targetRole,
            industry: p.industry || null,
            notes: `🤖 AI Recommended based on your profile — ${p.matchReason}`,
          })),
        });
      }

      // Create JDs from recommendations
      if (recommendedJDs.length > 0) {
        await Promise.all(
          recommendedJDs.map((jd) =>
            prisma.jobDescription.create({
              data: {
                userId,
                title: jd.title,
                company: jd.company || null,
                rawText: jd.rawText,
                notes: `🤖 AI Recommended based on your profile — ${jd.matchReason}`,
                positionProfileId: null,
              },
            })
          )
        );
      }
    } catch (recErr) {
      console.error("Failed to generate recommendations:", recErr);
      // Non-blocking: onboarding still succeeds
    }

    return NextResponse.json(
      {
        profile,
        roadmap: {
          id: roadmap.id,
          strategyOverview: roadmap.strategyOverview,
          generatedAt: roadmap.generatedAt,
          weeks: roadmap.weeks.map((w) => ({
            id: w.id,
            weekNumber: w.weekNumber,
            phase: w.phase,
            focusTitle: w.focusTitle,
            tasks: JSON.parse(w.tasks),
            milestone: w.milestone,
          })),
        },
        recommendations: {
          positionsCreated: recommendedPositions.length,
          jdsCreated: recommendedJDs.length,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Onboarding complete error:", err);
    return NextResponse.json(
      { error: "Failed to complete onboarding." },
      { status: 500 }
    );
  }
}
