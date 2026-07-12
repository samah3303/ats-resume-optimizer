import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResumeAgainstJD } from "@/lib/deepseek";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      resume: { select: { name: true } },
      jobDescription: { select: { title: true } },
    },
  });

  return NextResponse.json({ analyses });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { resumeId, jdId, positionProfileId, pasteJdTitle, pasteJdText, jobType } =
      body;

    if (!resumeId) {
      return NextResponse.json(
        { error: "resumeId is required." },
        { status: 400 }
      );
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found." },
        { status: 404 }
      );
    }

    let jobDescriptionId: string;
    let jobDescriptionText: string;

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

      jobDescriptionId = jd.id;
      jobDescriptionText = jd.rawText;
    } else if (pasteJdTitle && pasteJdText) {
      // Create a new JD from pasted text
      const jd = await prisma.jobDescription.create({
        data: {
          userId,
          title: pasteJdTitle,
          rawText: pasteJdText,
          positionProfileId: positionProfileId || null,
        },
      });
      jobDescriptionId = jd.id;
      jobDescriptionText = pasteJdText;
    } else {
      return NextResponse.json(
        { error: "Either jdId or pasteJdTitle+pasteJdText is required." },
        { status: 400 }
      );
    }

    // Get position profile title for context
    let positionTitle: string | undefined;
    if (positionProfileId) {
      const pos = await prisma.positionProfile.findFirst({
        where: { id: positionProfileId, userId },
      });
      if (pos) {
        positionTitle = pos.title;
      }
    }

    // Create pending analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        resumeId,
        jobDescriptionId,
        rawAiResponse: "",
      },
    });

    // Run AI analysis
    try {
      const result = await analyzeResumeAgainstJD({
        resumeText: resume.parsedText,
        jobDescriptionText,
        positionTitle,
        jobType: jobType || undefined,
      });

      // Update analysis with results
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          overallScore: result.overallScore,
          keywordsMatchPct: result.keywordsMatchPct,
          skillsGapJson: result.skillsGapJson,
          formatScore: result.formatScore,
          impactScore: result.impactScore,
          summaryText: result.summaryText,
          rawAiResponse: JSON.stringify(result),
        },
      });

      // Create suggestions
      if (result.suggestions?.length > 0) {
        await prisma.suggestion.createMany({
          data: result.suggestions.map((s) => ({
            analysisId: analysis.id,
            section: s.section,
            originalText: s.originalText,
            suggestedText: s.suggestedText,
            rationale: s.rationale,
          })),
        });
      }

      const updatedAnalysis = await prisma.analysis.findUnique({
        where: { id: analysis.id },
        include: {
          resume: { select: { id: true, name: true } },
          jobDescription: {
            select: { id: true, title: true, company: true },
          },
        },
      });

      return NextResponse.json({ analysis: updatedAnalysis }, { status: 201 });
    } catch (err) {
      console.error("AI analysis error:", err);
      // Keep the pending analysis but return error
      return NextResponse.json(
        { error: "AI analysis failed. Please try again.", analysisId: analysis.id },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      { error: "Failed to run analysis." },
      { status: 500 }
    );
  }
}
