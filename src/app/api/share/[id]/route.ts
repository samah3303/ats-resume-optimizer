import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: token } = await params;

  try {
    const shared = await prisma.sharedAnalysis.findUnique({
      where: { token },
      include: {
        analysis: {
          include: {
            suggestions: {
              select: {
                id: true,
                section: true,
                originalText: true,
                suggestedText: true,
                rationale: true,
              },
            },
            resume: {
              select: {
                name: true,
              },
            },
            jobDescription: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!shared) {
      return NextResponse.json(
        { error: "Shared analysis not found." },
        { status: 404 }
      );
    }

    const { analysis } = shared;

    // Return a public-safe subset of the analysis
    return NextResponse.json({
      analysis: {
        id: analysis.id,
        overallScore: analysis.overallScore,
        keywordsMatchPct: analysis.keywordsMatchPct,
        skillsGapJson: analysis.skillsGapJson,
        formatScore: analysis.formatScore,
        impactScore: analysis.impactScore,
        summaryText: analysis.summaryText,
        createdAt: analysis.createdAt,
        suggestions: analysis.suggestions,
        resumeName: analysis.resume?.name || "Unknown Resume",
        jdTitle: analysis.jobDescription.title,
      },
    });
  } catch (err) {
    console.error("Shared analysis fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch shared analysis." },
      { status: 500 }
    );
  }
}
