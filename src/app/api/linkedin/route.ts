import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeLinkedInProfile } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { profileText, jdId } = body;

    if (!profileText || typeof profileText !== "string" || profileText.trim().length === 0) {
      return NextResponse.json(
        { error: "profileText is required." },
        { status: 400 }
      );
    }

    let jobDescriptionText: string | undefined;
    let jobTitle: string | undefined;
    let jd: { id: string; title: string; rawText: string } | null = null;

    if (jdId) {
      jd = await prisma.jobDescription.findFirst({
        where: { id: jdId, userId },
      });
      if (!jd) {
        return NextResponse.json(
          { error: "Job description not found." },
          { status: 404 }
        );
      }
      jobDescriptionText = jd.rawText;
      jobTitle = jd.title;
    }

    const result = await analyzeLinkedInProfile({
      profileText,
      jobDescriptionText,
      jobTitle,
    });

    // Create a Resume record from the LinkedIn profile text
    const resume = await prisma.resume.create({
      data: {
        userId,
        name: `LinkedIn Profile${jobTitle ? ` - ${jobTitle}` : ""}`,
        parsedText: profileText,
      },
    });

    let analysis = null;

    // If we have a JD, create an Analysis record
    if (jd) {
      analysis = await prisma.analysis.create({
        data: {
          userId,
          resumeId: resume.id,
          jobDescriptionId: jd.id,
          overallScore: result.overallScore,
          keywordsMatchPct: result.keywordsMatchPct,
          skillsGapJson: result.skillsGapJson,
          summaryText: result.summaryText,
          rawAiResponse: JSON.stringify(result),
        },
      });

      // Create suggestions
      if (result.suggestions?.length > 0) {
        await prisma.suggestion.createMany({
          data: result.suggestions.map((s) => ({
            analysisId: analysis!.id,
            section: s.section,
            originalText: s.originalText,
            suggestedText: s.suggestedText,
            rationale: s.rationale,
          })),
        });
      }

      // Reload with relations
      analysis = await prisma.analysis.findUnique({
        where: { id: analysis.id },
        include: {
          resume: { select: { id: true, name: true } },
          jobDescription: { select: { id: true, title: true, company: true } },
        },
      });
    }

    return NextResponse.json({ analysis, resume }, { status: 201 });
  } catch (err) {
    console.error("LinkedIn profile analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze LinkedIn profile." },
      { status: 500 }
    );
  }
}
