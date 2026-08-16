import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "kyro-admin-2026";
const LEGACY_KEY = "resumatch-admin-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== ADMIN_KEY && key !== LEGACY_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [users, resumes, jds, analyses, onboardingProfiles, roadmaps, shared, usageLogAggregate] =
      await Promise.all([
        prisma.user.count(),
        prisma.resume.count(),
        prisma.jobDescription.count(),
        prisma.analysis.count(),
        prisma.onboardingProfile.count(),
        prisma.roadmap.count(),
        prisma.sharedAnalysis.count(),
        prisma.aiUsageLog.aggregate({
          _sum: {
            totalTokens: true,
            costINR: true,
            costUSD: true,
          },
          _count: { id: true },
        }),
      ]);

    let totalTokens = usageLogAggregate._sum.totalTokens || 0;
    let totalSpendINR = Math.round((usageLogAggregate._sum.costINR || 0) * 100) / 100;
    let totalSpendUSD = Math.round((usageLogAggregate._sum.costUSD || 0) * 100) / 100;

    // Fallback to model estimates if no exact logs recorded yet for legacy records
    if (usageLogAggregate._count.id === 0) {
      const avgTokensPerAnalysis = 2500;
      const avgTokensPerRoadmap = 1800;
      const avgTokensPerOnboarding = 1500;
      const avgTokensPerJobFetch = 800;

      const estimatedAnalysisTokens = analyses * avgTokensPerAnalysis;
      const estimatedRoadmapTokens = roadmaps * avgTokensPerRoadmap;
      const estimatedOnboardingTokens = onboardingProfiles * avgTokensPerOnboarding;
      const estimatedJobTokens = jds * avgTokensPerJobFetch;

      totalTokens =
        estimatedAnalysisTokens +
        estimatedRoadmapTokens +
        estimatedOnboardingTokens +
        estimatedJobTokens;

      const costPer1kTokensINR = 0.052;
      totalSpendINR = Math.round(totalTokens * (costPer1kTokensINR / 1000) * 100) / 100;
      totalSpendUSD = Math.round((totalSpendINR / 83) * 100) / 100;
    }

    const avgSpendPerUserINR = users > 0 ? (totalSpendINR / users).toFixed(2) : "0.00";

    // Feature breakdown spend in INR
    const analysisUsage = await prisma.aiUsageLog.aggregate({
      where: { feature: "analysis" },
      _sum: { costINR: true, totalTokens: true },
    });
    const roadmapUsage = await prisma.aiUsageLog.aggregate({
      where: { feature: "roadmap" },
      _sum: { costINR: true, totalTokens: true },
    });
    const onboardingUsage = await prisma.aiUsageLog.aggregate({
      where: { feature: "onboarding" },
      _sum: { costINR: true, totalTokens: true },
    });

    const costPer1kTokensINR = 0.052;
    const spendByFeatureINR = {
      analyses: analysisUsage._sum.costINR || Math.round(analyses * 2500 * (costPer1kTokensINR / 1000) * 100) / 100,
      roadmaps: roadmapUsage._sum.costINR || Math.round(roadmaps * 1800 * (costPer1kTokensINR / 1000) * 100) / 100,
      onboarding: onboardingUsage._sum.costINR || Math.round(onboardingProfiles * 1500 * (costPer1kTokensINR / 1000) * 100) / 100,
      jobFetches: Math.round(jds * 800 * (costPer1kTokensINR / 1000) * 100) / 100,
    };

    // Recent analyses with details
    const recentAnalyses = await prisma.analysis.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        resume: { select: { name: true } },
        jobDescription: { select: { title: true, company: true } },
        user: { select: { email: true, name: true } },
      },
    });

    // Average score
    const avgScoreResult = await prisma.analysis.aggregate({
      _avg: { overallScore: true },
      where: { overallScore: { not: null } },
    });

    // Score distribution
    const high = await prisma.analysis.count({ where: { overallScore: { gte: 70 } } });
    const medium = await prisma.analysis.count({
      where: { overallScore: { gte: 40, lt: 70 } },
    });
    const low = await prisma.analysis.count({ where: { overallScore: { lt: 40 } } });

    // Recent users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    });

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const allRecentAnalyses = await prisma.analysis.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const dailyTrend: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyTrend[d.toISOString().split("T")[0]] = 0;
    }
    allRecentAnalyses.forEach((a) => {
      const day = a.createdAt.toISOString().split("T")[0];
      if (dailyTrend[day] !== undefined) dailyTrend[day]++;
    });

    // Target Country Distribution from Onboarding Profiles
    const onboardingData = await prisma.onboardingProfile.findMany({
      select: { targetCountry: true, targetPositions: true, industry: true },
    });

    const countryCounts: Record<string, number> = {};
    const positionCounts: Record<string, number> = {};

    onboardingData.forEach((p) => {
      if (p.targetCountry) {
        countryCounts[p.targetCountry] = (countryCounts[p.targetCountry] || 0) + 1;
      }
      if (p.targetPositions) {
        p.targetPositions.split(",").forEach((pos) => {
          const trimmed = pos.trim();
          if (trimmed) {
            positionCounts[trimmed] = (positionCounts[trimmed] || 0) + 1;
          }
        });
      }
    });

    const topCountries = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topPositions = Object.entries(positionCounts)
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top users by analysis count
    const topUsers = await prisma.analysis.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topUserDetails = await Promise.all(
      topUsers.map(async (u) => {
        const user = await prisma.user.findUnique({
          where: { id: u.userId },
          select: { email: true, name: true, createdAt: true },
        });
        return {
          email: user?.email || "unknown",
          name: user?.name || "—",
          analysisCount: u._count.id,
          joined: user?.createdAt,
        };
      })
    );

    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        _count: { select: { analyses: true, resumes: true } },
      },
    });

    return NextResponse.json({
      stats: {
        users,
        newUsers,
        resumes,
        jobs: jds,
        analyses,
        onboardingProfiles,
        roadmaps,
        sharedLinks: shared,
        averageScore: Math.round(avgScoreResult._avg.overallScore || 0),
        scoreDistribution: { high, medium, low },
        dailyTrend,
        // AI Token & Spend Metrics (exact logged + model estimation fallback)
        aiTokenSpend: {
          totalTokens,
          totalSpendINR,
          totalSpendUSD,
          avgSpendPerUserINR,
          spendByFeatureINR,
        },
        marketInsights: {
          topCountries,
          topPositions,
        },
      },
      topUsers: topUserDetails,
      recentUsers: recentUsers.map((u) => ({
        email: u.email,
        name: u.name || "—",
        joined: u.createdAt,
        analysisCount: u._count.analyses,
        resumeCount: u._count.resumes,
      })),
      recentAnalyses: recentAnalyses.map((a) => ({
        id: a.id,
        score: a.overallScore,
        date: a.createdAt,
        resume: a.resume?.name || "—",
        jd: `${a.jobDescription?.title || "Untitled"}${a.jobDescription?.company ? ` (${a.jobDescription.company})` : ""}`,
        user: a.user.email,
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
