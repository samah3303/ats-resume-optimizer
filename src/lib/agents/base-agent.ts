/**
 * Base Agent Framework
 * Provides multi-step agent capabilities using Vercel AI SDK with DeepSeek.
 * Each agent implements its own multi-step logic (extract → analyze → generate → verify)
 * rather than relying on the AI SDK's automatic tool-execution loop.
 *
 * The `standardTools` helper functions provide direct DB access for any agent
 * that needs user context (profile, resumes, analyses, JDs, applications).
 */

import { prisma } from "@/lib/prisma";

// ─── Provider Setup ─────────────────────────────────────────────────────────

export function getDeepSeekProviderConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is required for agent operations");
  }
  return {
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  };
}

export const AGENT_MODEL = "deepseek-v4-flash";

// ─── Standard Data Helpers (used by agents directly, not as AI tools) ───────

export const userData = {
  async getProfile(userId: string) {
    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });
    if (!profile) return null;
    return {
      targetPositions: JSON.parse(profile.targetPositions || "[]"),
      targetCountry: profile.targetCountry,
      industry: profile.industry,
      jobType: profile.jobType,
      coreSkills: JSON.parse(profile.coreSkills || "[]"),
      generalAtsScore: profile.generalAtsScore,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      githubUrl: profile.githubUrl,
    };
  },

  async getResumes(userId: string, limit = 10) {
    return prisma.resume.findMany({
      where: { userId },
      select: { id: true, name: true, parsedText: true, docType: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async getAnalysisHistory(userId: string, limit = 10) {
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        resume: { select: { name: true } },
        jobDescription: { select: { title: true, company: true } },
        suggestions: {
          where: { accepted: true },
          select: { section: true, originalText: true, suggestedText: true },
        },
      },
    });
    return analyses.map((a) => ({
      id: a.id,
      overallScore: a.overallScore,
      keywordsMatchPct: a.keywordsMatchPct,
      formatScore: a.formatScore,
      impactScore: a.impactScore,
      summaryText: a.summaryText,
      resumeName: a.resume?.name,
      jdTitle: a.jobDescription?.title,
      jdCompany: a.jobDescription?.company,
      acceptedSuggestions: a.suggestions.length,
      createdAt: a.createdAt.toISOString(),
    }));
  },

  async getJobDescriptions(userId: string, limit = 20) {
    return prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, title: true, company: true, rawText: true, sourceUrl: true, createdAt: true },
    });
  },

  async getApplications(userId: string) {
    const apps = await prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        jobDescription: { select: { title: true, company: true } },
      },
    });
    return apps.map((a) => ({
      id: a.id,
      status: a.status,
      notes: a.notes,
      appliedAt: a.appliedAt?.toISOString(),
      jdTitle: a.jobDescription.title,
      jdCompany: a.jobDescription.company,
    }));
  },
};

// ─── Agent Context Builder ──────────────────────────────────────────────────

/**
 * Builds a rich context string for any agent from the user's full profile.
 * Agents can inject this into their system prompt for personalization.
 */
export async function buildAgentContext(userId: string): Promise<string> {
  const profile = await userData.getProfile(userId);
  const analyses = await userData.getAnalysisHistory(userId, 5);
  const apps = await userData.getApplications(userId);

  const parts: string[] = [];

  if (profile) {
    parts.push(`## User Profile
- Target Positions: ${profile.targetPositions.join(", ")}
- Target Country: ${profile.targetCountry}
- Industry: ${profile.industry || "Not specified"}
- Core Skills: ${profile.coreSkills.join(", ")}
- General ATS Score: ${profile.generalAtsScore ?? "N/A"}`);
  }

  if (analyses.length > 0) {
    const avgScore = Math.round(
      analyses.reduce((s, a) => s + (a.overallScore || 0), 0) / analyses.length
    );
    parts.push(`## Recent Analyses (${analyses.length})
- Average Score: ${avgScore}/100
- Latest: ${analyses[0]?.jdTitle || "Unknown"} — ${analyses[0]?.overallScore}/100`);
  }

  if (apps.length > 0) {
    const byStatus: Record<string, number> = {};
    apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
    parts.push(`## Application Pipeline
${Object.entries(byStatus).map(([s, c]) => `- ${s}: ${c}`).join("\n")}`);
  }

  return parts.join("\n\n");
}
