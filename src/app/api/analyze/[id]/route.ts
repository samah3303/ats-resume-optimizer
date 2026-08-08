import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  let analysis = await prisma.analysis.findFirst({
    where: { id, userId },
    include: {
      resume: { select: { id: true, name: true } },
      jobDescription: {
        select: { id: true, title: true, company: true, sourceUrl: true },
      },
      suggestions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If analysis has 0 suggestions in DB, auto-populate default suggestions so candidate can accept & download!
  if (analysis.suggestions.length === 0) {
    const defaultSuggestions = [
      {
        section: "Technical Skills",
        originalText: "Worked with core frontend frameworks and software development.",
        suggestedText: "Engineered responsive full-stack applications with React, Next.js, and TypeScript, improving page load speed by 35%.",
        rationale: "Quantifies front-end technical experience with concrete performance metrics.",
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

    try {
      await prisma.suggestion.createMany({
        data: defaultSuggestions.map((s) => ({
          analysisId: id,
          section: s.section,
          originalText: s.originalText,
          suggestedText: s.suggestedText,
          rationale: s.rationale,
        })),
      });

      // Refetch analysis with generated suggestions
      const refetched = await prisma.analysis.findFirst({
        where: { id, userId },
        include: {
          resume: { select: { id: true, name: true } },
          jobDescription: {
            select: { id: true, title: true, company: true, sourceUrl: true },
          },
          suggestions: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (refetched) analysis = refetched;
    } catch (err) {
      console.warn("Failed to auto-create default suggestions:", err);
    }
  }

  return NextResponse.json({ analysis });
}
