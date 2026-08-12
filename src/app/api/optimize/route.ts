import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOptimizedResumePdf } from "@/lib/pdf-generator";
import { generateDocxResume, TemplateType } from "@/lib/docx-generator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const {
      analysisId,
      acceptedSuggestionIds,
      format = "pdf",
      template = "emerald_tech",
    } = body;

    if (!analysisId || !acceptedSuggestionIds?.length) {
      return NextResponse.json(
        { error: "analysisId and acceptedSuggestionIds are required." },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId },
      include: {
        resume: true,
        jobDescription: { select: { title: true, rawText: true } },
        suggestions: {
          where: { id: { in: acceptedSuggestionIds } },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found." },
        { status: 404 }
      );
    }

    if (analysis.suggestions.length === 0) {
      return NextResponse.json(
        { error: "No matching suggestions found for the provided IDs." },
        { status: 400 }
      );
    }

    const resume = analysis.resume;

    if (!resume) {
      return NextResponse.json(
        { error: "Original resume was deleted." },
        { status: 404 }
      );
    }

    // AI agent rewrite to preserve candidate identity & apply STAR fixes
    const { runResumeWriterAgent } = await import("@/lib/agents/resume-writer-agent");
    const writerResult = await runResumeWriterAgent({
      resumeText: resume.parsedText,
      jobDescriptionTitle: analysis.jobDescription.title,
      jobDescriptionText: analysis.jobDescription.rawText,
      suggestions: analysis.suggestions.map((s) => ({
        section: s.section,
        originalText: s.originalText,
        suggestedText: s.suggestedText,
        rationale: s.rationale,
      })),
    });

    if (format === "docx") {
      const docxBuffer = await generateDocxResume(
        writerResult.finalResume,
        template as TemplateType
      );

      return new NextResponse(new Uint8Array(docxBuffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="optimized-${sanitizeFilename(resume.name)}.docx"`,
        },
      });
    }

    // PDF path
    const pdfBuffer = await generateOptimizedResumePdf(
      writerResult.finalResume,
      resume.name
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="optimized-${sanitizeFilename(resume.name)}.pdf"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Optimize error:", err);
    return NextResponse.json(
      { error: `Failed to generate optimized resume: ${message}` },
      { status: 500 }
    );
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}
