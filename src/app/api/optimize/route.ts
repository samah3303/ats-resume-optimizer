import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateOptimizedResume } from "@/lib/deepseek";
import { generateOptimizedResumePdf } from "@/lib/pdf-generator";
import { modifyDocxText } from "@/lib/docx-modifier";
import { loadOriginalFile, getOriginalFormat } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { analysisId, acceptedSuggestionIds } = body;

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
        jobDescription: { select: { title: true } },
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

    let originalFormat: string | null = null;
    try {
      originalFormat = await getOriginalFormat(resume.id);
    } catch {
      // original file not stored — will fall through to PDF path
    }

    const isDocx =
      originalFormat ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (isDocx) {
      // ── DOCX path: modify the original file in-place ──
      try {
        const docxBuffer = await loadOriginalFile(resume.id);
        const modifiedBuffer = await modifyDocxText(
          docxBuffer,
          analysis.suggestions.map((s) => ({
            originalText: s.originalText,
            suggestedText: s.suggestedText,
          }))
        );

        return new NextResponse(new Uint8Array(modifiedBuffer), {
          headers: {
            "Content-Type": originalFormat ?? "application/octet-stream",
            "Content-Disposition": `attachment; filename="optimized-${sanitizeFilename(resume.name)}.docx"`,
          },
        });
      } catch (err) {
        console.error("DOCX modification failed, falling back to PDF:", err);
        // Fall through to PDF generation below
      }
    }

    // ── PDF path: AI rewrite + pdfkit (fallback for .pdf, .doc, and failed docx) ──
    const optimizedText = await generateOptimizedResume(
      resume.parsedText,
      analysis.suggestions.map((s) => ({
        section: s.section,
        originalText: s.originalText,
        suggestedText: s.suggestedText,
      })),
      analysis.jobDescription.title
    );

    const pdfBuffer = await generateOptimizedResumePdf(
      optimizedText,
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
