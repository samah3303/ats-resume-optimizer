import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateResumeComparisons } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { resumeIds } = body;

    if (!resumeIds || !Array.isArray(resumeIds) || resumeIds.length < 2) {
      return NextResponse.json(
        { error: "resumeIds must be an array with at least 2 resume IDs." },
        { status: 400 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: {
        id: { in: resumeIds },
        userId,
      },
    });

    if (resumes.length < 2) {
      return NextResponse.json(
        { error: "At least 2 valid resumes belonging to the user are required." },
        { status: 400 }
      );
    }

    const resumeInputs = resumes.map((r) => ({
      name: r.name,
      parsedText: r.parsedText,
    }));

    const comparisons = await generateResumeComparisons({ resumes: resumeInputs });

    return NextResponse.json({ comparisons });
  } catch (err) {
    console.error("Resume comparison error:", err);
    return NextResponse.json(
      { error: "Failed to compare resumes." },
      { status: 500 }
    );
  }
}
