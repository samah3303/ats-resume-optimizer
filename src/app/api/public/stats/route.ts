import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Next.js Cache for 1 hour

export interface PublicStatsResponse {
  resumesAnalyzed: number;
  jobsTracked: number;
  averageImprovement: number | null;
  hasSufficientData: boolean;
}

let cachedStats: { data: PublicStatsResponse; expiresAt: number } | null = null;
const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const now = Date.now();
    if (!forceRefresh && cachedStats && cachedStats.expiresAt > now) {
      return NextResponse.json(cachedStats.data, {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Cache": "HIT",
        },
      });
    }

    // 1. Resumes Analyzed count: SELECT COUNT(*) FROM profiles WHERE ats_score IS NOT NULL
    const resumesAnalyzed = await prisma.profile.count({
      where: { atsScore: { not: null } },
    });

    // 2. Jobs Tracked count: SELECT COUNT(*) FROM jobs
    const jobsTracked = await prisma.job.count();

    // 3. Average ATS improvement (compute from real data if available)
    let averageImprovement: number | null = null;
    const applicationsWithScore = await prisma.application.findMany({
      where: { atsScore: { not: null } },
      select: { atsScore: true, userId: true },
    });

    if (applicationsWithScore.length > 0) {
      const userIds = [...new Set(applicationsWithScore.map((a) => a.userId))];
      const profiles = await prisma.profile.findMany({
        where: { userId: { in: userIds }, atsScore: { not: null } },
        select: { userId: true, atsScore: true },
      });
      const profileScoreMap = new Map(profiles.map((p) => [p.userId, p.atsScore!]));

      let totalDiff = 0;
      let count = 0;
      for (const app of applicationsWithScore) {
        const baseScore = profileScoreMap.get(app.userId);
        if (baseScore !== undefined && app.atsScore !== null && app.atsScore > baseScore) {
          totalDiff += app.atsScore - baseScore;
          count++;
        }
      }

      if (count > 0) {
        averageImprovement = Math.round(totalDiff / count);
      }
    }

    // If counts are below 100, flag hasSufficientData as false
    const hasSufficientData = resumesAnalyzed >= 100 || jobsTracked >= 100;

    const data: PublicStatsResponse = {
      resumesAnalyzed,
      jobsTracked,
      averageImprovement,
      hasSufficientData,
    };

    cachedStats = {
      data,
      expiresAt: now + ONE_HOUR_MS,
    };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return NextResponse.json(
      {
        resumesAnalyzed: 0,
        jobsTracked: 0,
        averageImprovement: null,
        hasSufficientData: false,
      },
      { status: 500 }
    );
  }
}
