import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { resumeId, jdId, resumeText, jdText } = body;

    let resumeContent: string;
    let jobDescriptionContent: string;
    let jobTitle: string | undefined;
    let company: string | undefined;

    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        return NextResponse.json(
          { error: "Resume not found." },
          { status: 404 }
        );
      }
      resumeContent = resume.parsedText;
    } else if (resumeText) {
      resumeContent = resumeText;
    } else {
      return NextResponse.json(
        { error: "resumeId or resumeText is required." },
        { status: 400 }
      );
    }

    if (jdId) {
      const jd = await prisma.jobDescription.findFirst({
        where: { id: jdId, userId },
      });
      if (!jd) {
        return NextResponse.json(
          { error: "Job description not found." },
          { status: 404 }
        );
      }
      jobDescriptionContent = jd.rawText;
      jobTitle = jd.title;
      company = jd.company || undefined;
    } else if (jdText) {
      jobDescriptionContent = jdText;
    } else {
      return NextResponse.json(
        { error: "jdId or jdText is required." },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetter({
      resumeText: resumeContent,
      jobDescriptionText: jobDescriptionContent,
      jobTitle,
      company,
    });

    return NextResponse.json({ coverLetter });
  } catch (err) {
    console.error("Cover letter generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate cover letter." },
      { status: 500 }
    );
  }
}
