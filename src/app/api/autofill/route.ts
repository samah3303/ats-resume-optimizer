import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { autoFillFromResume } from "@/lib/resume-autofill";

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

    const result = await autoFillFromResume(resume.parsedText);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Auto-fill error:", err);
    return NextResponse.json(
      { error: "Failed to auto-fill from resume" },
      { status: 500 }
    );
  }
}
