import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startVoiceInterviewSession, InterviewPersonaType } from "@/lib/ai/voice-interview";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { persona = "phone_screen", targetRole, companyTarget, resumeId, difficulty } = body;

    let resumeSummary = "";
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (resume) {
        resumeSummary = resume.parsedText;
      }
    }

    if (!resumeSummary) {
      const latestResume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (latestResume) {
        resumeSummary = latestResume.parsedText;
      }
    }

    const sessionData = await startVoiceInterviewSession({
      persona: persona as InterviewPersonaType,
      targetRole: targetRole || "Senior Full-Stack Engineer",
      companyTarget: companyTarget || "Target Tech Company",
      candidateName: session.user.name || "Candidate",
      resumeSummary,
      difficulty: difficulty || "senior",
    });

    return NextResponse.json({ data: sessionData });
  } catch (err) {
    console.error("Start voice interview API error:", err);
    return NextResponse.json(
      { error: "Failed to initialize interview session." },
      { status: 500 }
    );
  }
}
