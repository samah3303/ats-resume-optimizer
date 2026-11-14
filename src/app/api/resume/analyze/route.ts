import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeAtsScore } from "@/lib/ai-tools";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile?.resumeText) {
      return NextResponse.json(
        { error: "No resume found. Please upload your resume first." },
        { status: 404 },
      );
    }

    const analysis = await analyzeAtsScore(profile.resumeText);

    // Update profile with analysis results
    await prisma.profile.update({
      where: { userId },
      data: {
        atsScore: analysis.overallScore,
        atsBreakdown: JSON.stringify({
          keywordScore: analysis.keywordScore,
          formatScore: analysis.formatScore,
          impactScore: analysis.impactScore,
          quantificationScore: analysis.quantificationScore,
          details: analysis.details,
        }),
        recommendations: JSON.stringify(analysis.recommendations),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "resume_analyzed",
        details: `ATS score: ${analysis.overallScore}/100`,
      },
    });

    return NextResponse.json({
      overallScore: analysis.overallScore,
      keywordScore: analysis.keywordScore,
      formatScore: analysis.formatScore,
      impactScore: analysis.impactScore,
      quantificationScore: analysis.quantificationScore,
      details: analysis.details,
      recommendations: analysis.recommendations,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 },
    );
  }
}
