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
    const {
      resumeId,
      targetPositions,
      targetCountry,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      industry,
      jobType,
    } = body;

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

    // Mark chosen resume as primary, reset others
    await prisma.resume.updateMany({
      where: { userId, id: { not: resumeId } },
      data: { isPrimary: false },
    });
    await prisma.resume.update({
      where: { id: resumeId },
      data: { isPrimary: true },
    });

    // Step 1: Run Mode 1 onboarding analysis
    let mode1Result: Awaited<ReturnType<typeof mode1OnboardingAnalysis>>;
    try {
      mode1Result = await mode1OnboardingAnalysis(
        resume.parsedText,
        positions,
        targetCountry,
        linkedinUrl || undefined
      );
    } catch (err) {
      console.error("Mode 1 onboarding analysis failed:", err);
      return NextResponse.json(
        { error: "AI analysis failed. Please try again." },
        { status: 502 }
      );
    }

    // Step 2: Upsert onboarding profile (create or update)
    const profile = await prisma.onboardingProfile.upsert({
      where: { userId },
      create: {
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
        generalAtsScore: mode1Result.generalAtsScore,
        resumeImprovements: JSON.stringify(mode1Result.resumeImprovements),
      },
      update: {
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
        generalAtsScore: mode1Result.generalAtsScore,
        resumeImprovements: JSON.stringify(mode1Result.resumeImprovements),
      },
    });

    // Step 3: Generate roadmap
    let roadmap: any = null;
    try {
      const mode2Result = await mode2GenerateRoadmap(
        resume.parsedText,
        mode1Result.detectedCoreSkills,
        mode1Result.marketGaps,
        positions
      );

      // Delete any old roadmaps
      await prisma.roadmap.deleteMany({ where: { userId } });

      const getPhase = (weekNumber: number): string => {
        if (weekNumber <= 2) return "Foundation";
        if (weekNumber <= 5) return "High Velocity";
        return "Conversion";
      };

      roadmap = await prisma.roadmap.create({
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
    } catch (err) {
      console.error("Roadmap generation failed (non-blocking):", err);
    }

    // Step 4: Fire-and-forget recommendations (matching 50-60% of primary resume)
    generateRecommendationsAsync(
      userId,
      resume.parsedText,
      mode1Result.detectedCoreSkills,
      positions,
      targetCountry
    ).catch((err) => {
      console.error("Background recommendations failed:", err);
    });

    return NextResponse.json(
      {
        profile,
        message: "Primary resume and onboarding analysis updated successfully.",
        roadmap: roadmap
          ? {
              id: roadmap.id,
              strategyOverview: roadmap.strategyOverview,
              generatedAt: roadmap.generatedAt,
              weeks: roadmap.weeks.map((w: any) => ({
                id: w.id,
                weekNumber: w.weekNumber,
                phase: w.phase,
                focusTitle: w.focusTitle,
                tasks: JSON.parse(w.tasks),
                milestone: w.milestone,
              })),
            }
          : null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Onboarding complete error:", err);
    return NextResponse.json(
      { error: "Failed to complete onboarding." },
      { status: 500 }
    );
  }
}

async function generateRecommendationsAsync(
  userId: string,
  resumeText: string,
  coreSkills: string[],
  positions: string[],
  targetCountry: string
) {
  try {
    const [posRecs, jdRecs] = await Promise.all([
      generateRecommendedPositions(resumeText.slice(0, 3000), coreSkills, targetCountry),
      generateRecommendedJDs(resumeText.slice(0, 3000), coreSkills, positions, targetCountry),
    ]);

    if (posRecs.length > 0) {
      await prisma.positionProfile.createMany({
        data: posRecs.map((p) => ({
          userId,
          title: p.title,
          targetRole: p.targetRole,
          industry: p.industry || null,
          notes: `🤖 AI Recommended — ${p.matchReason}`,
        })),
        skipDuplicates: true,
      });
    }

    if (jdRecs.length > 0) {
      for (const jd of jdRecs) {
        await prisma.jobDescription.create({
          data: {
            userId,
            title: jd.title,
            company: jd.company || null,
            rawText: jd.rawText,
            notes: `🤖 AI Recommended (50-60% Primary Resume Match) — ${jd.matchReason}`,
          },
        });
      }
    }
  } catch (err) {
    console.error("[onboarding] Background recommendations failed:", err);
  }
}
