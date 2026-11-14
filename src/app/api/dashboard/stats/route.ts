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
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 },
    );
  }
}
