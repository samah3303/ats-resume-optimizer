import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLinkedInProfileOptimization } from "@/lib/ai/linkedin";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { resumeId, resumeText, targetRole, industry, tone } = body;

    let contentToAnalyze = resumeText || "";

    if (resumeId && !contentToAnalyze) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
      });
      if (resume) {
        contentToAnalyze = resume.parsedText;
      }
    }

    if (!contentToAnalyze) {
      // Try to find the user's primary/latest resume
      const latestResume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (latestResume) {
        contentToAnalyze = latestResume.parsedText;
      }
    }

    if (!contentToAnalyze) {
      return NextResponse.json(
        { error: "No resume content provided or found in your profile." },
        { status: 400 }
      );
    }

    const optimization = await generateLinkedInProfileOptimization({
      resumeText: contentToAnalyze,
      targetRole: targetRole || "Senior Software Engineer",
      industry: industry || "Technology",
      tone: tone || "executive",
    });

    return NextResponse.json({ data: optimization });
  } catch (err) {
    console.error("LinkedIn optimization API error:", err);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn optimization." },
      { status: 500 }
    );
  }
}
