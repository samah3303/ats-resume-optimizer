import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mode1OnboardingAnalysis, mode2GenerateRoadmap } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { resumeId } = await req.json();

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Mark as primary
    await prisma.resume.updateMany({
      where: { userId, id: { not: resumeId } },
      data: { isPrimary: false },
    });
    await prisma.resume.update({
      where: { id: resumeId },
      data: { isPrimary: true },
    });

    // If onboarding profile exists, re-run analysis with the new primary resume!
    const existingProfile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      const positions = existingProfile.targetPositions
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const mode1Result = await mode1OnboardingAnalysis(
        resume.parsedText,
        positions,
        existingProfile.targetCountry,
        existingProfile.targetCity,
        existingProfile.linkedinUrl || undefined
      );

      await prisma.onboardingProfile.update({
        where: { userId },
        data: {
          resumeId: resume.id,
          profileSummary: mode1Result.profileSummary,
          coreSkills: JSON.stringify(mode1Result.detectedCoreSkills),
          marketGaps: JSON.stringify(mode1Result.marketGaps),
          aiSuggestions: JSON.stringify(mode1Result.aiSuggestions),
          linkedinOpts: JSON.stringify(mode1Result.linkedinOptimizations),
          generalAtsScore: mode1Result.generalAtsScore,
          resumeImprovements: JSON.stringify(mode1Result.resumeImprovements),
        },
      });

      // Regenerate roadmap
      try {
        const mode2Result = await mode2GenerateRoadmap(
          resume.parsedText,
          mode1Result.detectedCoreSkills,
          mode1Result.marketGaps,
          positions,
          1, // nextGenCount
          existingProfile.targetCountry,
          existingProfile.targetCity
        );

        await prisma.roadmap.deleteMany({ where: { userId } });

        const getPhase = (weekNumber: number): string => {
          if (weekNumber <= 2) return "Foundation";
          if (weekNumber <= 5) return "High Velocity";
          return "Conversion";
        };

        await prisma.roadmap.create({
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
        });
      } catch (err) {
        console.error("Roadmap regeneration failed on primary resume change:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Primary resume updated to "${resume.name}". Onboarding analysis & ATS baseline score regenerated.`,
    });
  } catch (err) {
    console.error("Set primary resume error:", err);
    return NextResponse.json(
      { error: "Failed to update primary resume" },
      { status: 500 }
    );
  }
}
