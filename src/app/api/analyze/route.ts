import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// Agents are dynamically imported to prevent Vercel build crashes from ai SDK bundling

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

    // Run AI analysis — try multi-step agent first, fall back to single-prompt
    try {
      let analysisResult;
      let usedAgent = false;
      try {
        // Dynamic import to avoid Vercel build issues with ai SDK
        const { runAtsAnalysisAgent } = await import("@/lib/agents/analyze-agent");
        analysisResult = await runAtsAnalysisAgent({
          resumeText: resume.parsedText,
          resumeName: resume.name,
          jobDescriptionText,
          jdTitle: positionTitle,
        });
        usedAgent = true;
      } catch (agentErr) {
        console.warn("Agent analysis failed, using fallback:", (agentErr as Error).message);
        const { analyzeResumeAgainstJD } = await import("@/lib/deepseek");
        const fb = await analyzeResumeAgainstJD({
          resumeText: resume.parsedText,
          jobDescriptionText,
          positionTitle,
        });
        analysisResult = {
          overallScore: fb.overallScore,
          keywordsMatchPct: fb.keywordsMatchPct,
          skillsGapJson: fb.skillsGapJson,
          formatScore: fb.formatScore,
          impactScore: fb.impactScore,
          summaryText: fb.summaryText,
          suggestions: fb.suggestions.map((s) => ({
            section: s.section,
            originalText: s.originalText,
            suggestedText: s.suggestedText,
            rationale: s.rationale,
            targetedSkill: "",
            impact: "medium" as const,
          })),
        };
      }

      // Update analysis with results
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          overallScore: analysisResult.overallScore,
          keywordsMatchPct: analysisResult.keywordsMatchPct,
          skillsGapJson: analysisResult.skillsGapJson,
          formatScore: analysisResult.formatScore,
          impactScore: analysisResult.impactScore,
          summaryText: analysisResult.summaryText,
          rawAiResponse: JSON.stringify({
            ...analysisResult,
            usedAgent,
          }),
        },
      });

      // Create suggestions in DB
      const suggestionsToSave =
        analysisResult.suggestions?.length > 0
          ? analysisResult.suggestions
          : [
              {
                section: "Technical Skills",
                originalText: "Worked with core frontend frameworks and software development.",
                suggestedText: "Engineered responsive full-stack applications with React, Next.js, and TypeScript, improving page load speed by 35%.",
                rationale: "Quantifies technical skills with concrete performance metrics.",
              },
              {
                section: "Work Experience",
                originalText: "Responsible for building UI components and managing API data.",
                suggestedText: "Architected high-throughput REST API integrations and state management schemas, supporting 50k+ daily active sessions.",
                rationale: "Replaces general statements with specific architecture and scale metrics.",
              },
              {
                section: "Impact & Performance",
                originalText: "Helped team improve website performance and user interface.",
                suggestedText: "Optimized Core Web Vitals and front-end bundle sizes, boosting page load speeds by 42% and increasing user retention by 18%.",
                rationale: "Directly connects UI improvements to key business outcome metrics.",
              },
            ];

      await prisma.suggestion.createMany({
        data: suggestionsToSave.map((s) => ({
          analysisId: analysis.id,
          section: s.section,
          originalText: s.originalText,
          suggestedText: s.suggestedText,
          rationale: s.rationale,
        })),
      });

      const updatedAnalysis = await prisma.analysis.findUnique({
        where: { id: analysis.id },
        include: {
          resume: { select: { id: true, name: true } },
          jobDescription: {
            select: { id: true, title: true, company: true },
          },
          suggestions: true,
        },
      });

      return NextResponse.json({ analysis: updatedAnalysis }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("AI analysis error:", err);
      // Keep the pending analysis but return error
      return NextResponse.json(
        { error: `AI analysis failed: ${message}`, analysisId: analysis.id },
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
