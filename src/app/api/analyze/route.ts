import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractLocalKeywordMatch, pruneJobDescription } from "@/lib/keyword-matcher";
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
      let analysisResult: any;
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
            impact: "high" as const,
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

      // Local keyword check to supplement suggestions if AI returned fewer than 6
      const prunedJd = pruneJobDescription(jobDescriptionText);
      const localMatch = extractLocalKeywordMatch(resume.parsedText, prunedJd);
      const missingSkills = [...localMatch.skills.missing, ...localMatch.keywords.missing];

      let finalSuggestions = Array.isArray(analysisResult.suggestions)
        ? [...analysisResult.suggestions]
        : [];

      // If AI produced < 7 suggestions, dynamically generate additional strict suggestions based on missing JD skills
      if (finalSuggestions.length < 7 && missingSkills.length > 0) {
        const extraNeeded = 8 - finalSuggestions.length;
        const extraItems = missingSkills.slice(0, extraNeeded);
        extraItems.forEach((skill, idx) => {
          finalSuggestions.push({
            section: idx % 2 === 0 ? "Work Experience" : "Technical Skills",
            originalText: `Missing key JD skill: "${skill}"`,
            suggestedText: `Engineered scalable features using "${skill}" with performance benchmarking and metric ROI.`,
            rationale: `Including "${skill}" directly addresses a missing hard skill required by this target Job Description.`,
            targetedSkill: skill,
            impact: "high",
          });
        });
      }

      await prisma.suggestion.createMany({
        data: finalSuggestions.map((s: any) => ({
          analysisId: analysis.id,
          section: s.section || "Experience",
          originalText: s.originalText || "Weak bullet point",
          suggestedText: s.suggestedText || "ATS optimized STAR bullet point",
          rationale: s.rationale || "Improves keyword match score for this job description",
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
      console.error("Analysis execution failed:", err);
      return NextResponse.json(
        { error: "Failed to run analysis." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("POST /api/analyze error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
