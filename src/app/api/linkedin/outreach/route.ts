import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateColdOutreachSequence } from "@/lib/ai/linkedin";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const {
      candidateName,
      targetCompany,
      roleTitle,
      recruiterName,
      valueProp,
      resumeId,
      resumeText,
    } = body;

    if (!targetCompany || !roleTitle) {
      return NextResponse.json(
        { error: "Target company and role title are required." },
        { status: 400 }
      );
    }

    let resumeSummary = resumeText || "";
    if (resumeId && !resumeSummary) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (resume) {
        resumeSummary = resume.parsedText.slice(0, 1500);
      }
    }

    const sequence = await generateColdOutreachSequence({
      candidateName: candidateName || session.user.name || "Candidate",
      targetCompany,
      roleTitle,
      recruiterName: recruiterName || "Hiring Manager",
      valueProp: valueProp || "delivering high-performance full-stack architectures",
      resumeSummary,
    });

    return NextResponse.json({ data: sequence });
  } catch (err) {
    console.error("Cold outreach API error:", err);
    return NextResponse.json(
      { error: "Failed to generate outreach sequence." },
      { status: 500 }
    );
  }
}
