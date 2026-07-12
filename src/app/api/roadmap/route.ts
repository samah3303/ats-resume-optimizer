import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mode2GenerateRoadmap } from "@/lib/deepseek";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const roadmap = await prisma.roadmap.findFirst({
    where: { userId },
    orderBy: { generatedAt: "desc" },
    include: {
      weeks: { orderBy: { weekNumber: "asc" } },
    },
  });

  const parsed = roadmap
    ? {
        ...roadmap,
        weeks: roadmap.weeks.map((w) => ({
          ...w,
          tasks: JSON.parse(w.tasks) as string[],
        })),
      }
    : null;

  return NextResponse.json({ roadmap: parsed });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  // Get onboarding profile for context
  const profile = await prisma.onboardingProfile.findUnique({
    where: { userId },
    include: { resume: true },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Complete onboarding first before generating a roadmap." },
      { status: 400 }
    );
  }

  try {
    const positions = profile.targetPositions
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const coreSkills = JSON.parse(profile.coreSkills || "[]") as string[];
    const marketGaps = JSON.parse(profile.marketGaps || "[]") as Array<{
      type: string;
      description: string;
    }>;

    const result = await mode2GenerateRoadmap(
      profile.resume.parsedText,
      coreSkills,
      marketGaps,
      positions
    );

    const getPhase = (weekNumber: number): string => {
      if (weekNumber <= 2) return "Foundation";
      if (weekNumber <= 5) return "High Velocity";
      return "Conversion";
    };

    // Delete old roadmaps
    await prisma.roadmap.deleteMany({ where: { userId } });

    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        strategyOverview: result.strategyOverview,
        weeks: {
          create: result.weeks.map((w) => ({
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

    const parsed = {
      ...roadmap,
      weeks: roadmap.weeks.map((w) => ({
        ...w,
        tasks: JSON.parse(w.tasks) as string[],
      })),
    };

    return NextResponse.json({ roadmap: parsed }, { status: 201 });
  } catch (err) {
    console.error("Roadmap generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate roadmap." },
      { status: 500 }
    );
  }
}
