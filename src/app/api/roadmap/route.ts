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
        weeks: roadmap.weeks.map((w) => {
          let completedTasks: boolean[] = [];
          try {
            completedTasks = JSON.parse(w.completedTasks || "[]");
          } catch {
            completedTasks = [];
          }
          return {
            ...w,
            tasks: JSON.parse(w.tasks) as string[],
            completedTasks,
          };
        }),
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

    if (!profile.resume) {
      return NextResponse.json(
        { error: "Original resume was deleted. Please upload a new resume first." },
        { status: 400 }
      );
    }

    const existingRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { generatedAt: "desc" },
    });

    const nextGenCount = (existingRoadmap?.generationCount || 1) + 1;

    const result = await mode2GenerateRoadmap(
      profile.resume.parsedText,
      coreSkills,
      marketGaps,
      positions,
      nextGenCount
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
        generationCount: nextGenCount,
        weeks: {
          create: result.weeks.map((w) => ({
            weekNumber: w.weekNumber,
            phase: getPhase(w.weekNumber),
            focusTitle: w.focus,
            tasks: JSON.stringify(w.tasks),
            completedTasks: JSON.stringify(new Array(w.tasks.length).fill(false)),
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
        completedTasks: JSON.parse(w.completedTasks || "[]") as boolean[],
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

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { weekTaskId, taskIndex, completed } = await req.json();

    if (!weekTaskId || typeof taskIndex !== "number") {
      return NextResponse.json(
        { error: "weekTaskId and taskIndex are required" },
        { status: 400 }
      );
    }

    const weekTask = await prisma.weekTask.findUnique({
      where: { id: weekTaskId },
      include: { roadmap: true },
    });

    if (!weekTask || weekTask.roadmap.userId !== userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const tasks = JSON.parse(weekTask.tasks || "[]") as string[];
    let completedTasks = JSON.parse(weekTask.completedTasks || "[]") as boolean[];

    if (completedTasks.length < tasks.length) {
      completedTasks = new Array(tasks.length).fill(false);
    }

    completedTasks[taskIndex] = Boolean(completed);

    const updated = await prisma.weekTask.update({
      where: { id: weekTaskId },
      data: {
        completedTasks: JSON.stringify(completedTasks),
      },
    });

    return NextResponse.json({
      weekTask: {
        ...updated,
        tasks,
        completedTasks,
      },
    });
  } catch (err) {
    console.error("Update roadmap task error:", err);
    return NextResponse.json(
      { error: "Failed to update task state" },
      { status: 500 }
    );
  }
}
