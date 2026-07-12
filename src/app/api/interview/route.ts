import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewQuestions } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { analysisId, resumeId, jdId } = body;

    let skillsGapJson: string | undefined;
    let resumeText: string;
    let jobDescriptionText: string;
    let jobTitle: string | undefined;

    if (analysisId) {
      const analysis = await prisma.analysis.findFirst({
        where: { id: analysisId, userId },
        include: {
          resume: true,
          jobDescription: true,
        },
      });

      if (!analysis) {
        return NextResponse.json(
          { error: "Analysis not found." },
          { status: 404 }
        );
      }

      skillsGapJson = analysis.skillsGapJson || undefined;
      resumeText = analysis.resume.parsedText;
      jobDescriptionText = analysis.jobDescription.rawText;
      jobTitle = analysis.jobDescription.title;
    } else if (resumeId && jdId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found." },
          { status: 404 }
        );
      }

      const jd = await prisma.jobDescription.findFirst({
        where: { id: jdId, userId },
      });
      if (!jd) {
        return NextResponse.json(
          { error: "Job description not found." },
          { status: 404 }
        );
      }

      resumeText = resume.parsedText;
      jobDescriptionText = jd.rawText;
      jobTitle = jd.title;
    } else {
      return NextResponse.json(
        { error: "Either analysisId or both resumeId and jdId are required." },
        { status: 400 }
      );
    }

    const questions = await generateInterviewQuestions({
      skillsGapJson: skillsGapJson || undefined,
      resumeText: resumeText!,
      jobDescriptionText: jobDescriptionText!,
      jobTitle,
    });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("Interview questions generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate interview questions." },
      { status: 500 }
    );
  }
}
