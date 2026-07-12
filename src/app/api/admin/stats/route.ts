import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "resumatch-admin-2026";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [users, resumes, jds, analyses, onboardingProfiles, roadmaps, shared] =
      await Promise.all([
        prisma.user.count(),
        prisma.resume.count(),
        prisma.jobDescription.count(),
        prisma.analysis.count(),
        prisma.onboardingProfile.count(),
        prisma.roadmap.count(),
        prisma.sharedAnalysis.count(),
      ]);

    // Recent analyses with scores
    const recentAnalyses = await prisma.analysis.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        overallScore: true,
        createdAt: true,
        resume: { select: { name: true } },
        jobDescription: { select: { title: true } },
        user: { select: { email: true } },
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
      },
      recentAnalyses: recentAnalyses.map((a) => ({
        id: a.id,
        score: a.overallScore,
        date: a.createdAt,
        resume: a.resume?.name || "—",
        jd: a.jobDescription?.title || "—",
        user: a.user.email,
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
