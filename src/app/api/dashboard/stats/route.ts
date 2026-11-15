import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Fetch all application data in parallel
    const [applications, profile, recentLogs] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        include: { job: true },
      }),
      prisma.profile.findUnique({
        where: { userId },
        select: { atsScore: true },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Compute status distribution
    const allStatuses: ApplicationStatus[] = [
      "wishlist",
      "applied",
      "phone_screen",
      "interview",
      "offer",
      "accepted",
      "rejected",
    ];
    const statusDistribution = {} as Record<ApplicationStatus, number>;
    for (const s of allStatuses) {
      statusDistribution[s] = 0;
    }
    for (const app of applications) {
      const status = app.status as ApplicationStatus;
      if (status in statusDistribution) {
        statusDistribution[status]++;
      }
    }

    const totalApplications = applications.length;
    const activeApplications = applications.filter(
      (a) => !["rejected", "accepted"].includes(a.status),
    ).length;
    const interviewsScheduled = applications.filter(
      (a) => a.status === "interview" || a.status === "phone_screen",
    ).length;
    const offersReceived = applications.filter(
      (a) => a.status === "offer" || a.status === "accepted",
    ).length;

    // Funnel Analytics Computation
    const submittedApps = applications.filter((a) => a.status !== "wishlist");
    const appliedCount = submittedApps.length;
    const interviewApps = applications.filter((a) =>
      ["phone_screen", "interview", "offer", "accepted"].includes(a.status),
    );
    const offerApps = applications.filter((a) =>
      ["offer", "accepted"].includes(a.status),
    );

    const responseRate =
      appliedCount > 0
        ? Math.round((interviewApps.length / appliedCount) * 1000) / 10
        : 0;
    const offerRate =
      appliedCount > 0
        ? Math.round((offerApps.length / appliedCount) * 1000) / 10
        : 0;
    const interviewToOfferRate =
      interviewApps.length > 0
        ? Math.round((offerApps.length / interviewApps.length) * 1000) / 10
        : 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekApplied = submittedApps.filter(
      (a) => new Date(a.appliedAt || a.createdAt) >= sevenDaysAgo,
    ).length;
    const lastWeekApplied = submittedApps.filter((a) => {
      const d = new Date(a.appliedAt || a.createdAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;

    const weeklyTrend =
      lastWeekApplied > 0
        ? Math.round(((thisWeekApplied - lastWeekApplied) / lastWeekApplied) * 100)
        : thisWeekApplied > 0
        ? 100
        : 0;

    const scoresWithInterviews = interviewApps
      .map((a) => a.atsScore || a.job?.matchScore)
      .filter(Boolean) as number[];
    const allScores = applications
      .map((a) => a.atsScore || a.job?.matchScore)
      .filter(Boolean) as number[];

    const avgMatchScoreInterviewed =
      scoresWithInterviews.length > 0
        ? Math.round(
            scoresWithInterviews.reduce((acc, s) => acc + s, 0) /
              scoresWithInterviews.length,
          )
        : null;

    const avgMatchScoreTotal =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((acc, s) => acc + s, 0) / allScores.length,
          )
        : null;

    let benchmarkStatus: "exceptional" | "strong" | "average" | "needs_boost" =
      "needs_boost";
    let benchmarkMultiplier: number | null = null;
    let coachingInsight = "";

    if (responseRate >= 18) {
      benchmarkStatus = "exceptional";
      benchmarkMultiplier = Math.round((responseRate / 6) * 10) / 10;
      coachingInsight = `Outstanding conversion! You applied to ${appliedCount} jobs; ${interviewApps.length} reached Interview (${responseRate}% response rate) — ~${benchmarkMultiplier}x higher than the industry average (6%).`;
    } else if (responseRate >= 10) {
      benchmarkStatus = "strong";
      benchmarkMultiplier = Math.round((responseRate / 6) * 10) / 10;
      coachingInsight = `Strong response rate! Your ${responseRate}% conversion outpaces the industry average (6%). Keep applying to high-match vacancies to maintain momentum.`;
    } else if (responseRate > 0) {
      benchmarkStatus = "average";
      benchmarkMultiplier = 1.0;
      coachingInsight = `You have ${interviewApps.length} active interview progression(s). To elevate response rates further, run the resume ATS optimizer before submitting each application.`;
    } else if (appliedCount > 0) {
      benchmarkStatus = "needs_boost";
      benchmarkMultiplier = null;
      coachingInsight = `You have submitted ${appliedCount} application(s). Pro tip: Candidates who match 85%+ of targeted job keywords see their interview rate triple.`;
    } else {
      benchmarkStatus = "needs_boost";
      benchmarkMultiplier = null;
      coachingInsight = `Ready to launch your search? Move saved jobs to "Applied" or find new matches to start tracking your response rate.`;
    }

    const recentActivity = recentLogs.map((log) => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalApplications,
      activeApplications,
      interviewsScheduled,
      offersReceived,
      atsScore: profile?.atsScore ?? null,
      recentActivity,
      statusDistribution,
      funnel: {
        appliedCount,
        interviewCount: interviewApps.length,
        offerCount: offerApps.length,
        responseRate,
        offerRate,
        interviewToOfferRate,
        thisWeekApplied,
        lastWeekApplied,
        weeklyTrend,
        avgMatchScoreInterviewed,
        avgMatchScoreTotal,
        benchmarkStatus,
        benchmarkMultiplier,
        coachingInsight,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
