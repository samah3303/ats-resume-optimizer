import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      totalResumes,
      atsAgg,
      totalJobs,
      totalApplications,
      aiSearchesCount,
      allJobs,
      allApps,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.profile.count({
        where: {
          OR: [
            { resumeFileName: { not: null } },
            { resumeText: { not: null } },
          ],
        },
      }),
      prisma.profile.aggregate({
        _avg: { atsScore: true },
        where: { atsScore: { not: null } },
      }),
      prisma.job.count(),
      prisma.application.count(),
      prisma.activityLog.count({
        where: { action: "ai_job_search" },
      }),
      prisma.job.findMany({
        select: { source: true },
      }),
      prisma.application.findMany({
        select: { status: true },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          profile: {
            select: {
              atsScore: true,
              location: true,
              targetRoles: true,
              resumeFileName: true,
            },
          },
          _count: {
            select: { jobs: true, applications: true },
          },
        },
      }),
    ]);

    // Platform distribution
    const platformBreakdown: Record<string, number> = {
      naukrigulf: 0,
      indeed: 0,
      linkedin: 0,
      greenhouse_lever: 0,
      manual: 0,
      other: 0,
    };

    allJobs.forEach((j) => {
      const src = (j.source || "").toLowerCase();
      if (src.includes("naukri")) platformBreakdown.naukrigulf++;
      else if (src.includes("indeed")) platformBreakdown.indeed++;
      else if (src.includes("linkedin")) platformBreakdown.linkedin++;
      else if (src.includes("greenhouse") || src.includes("lever")) platformBreakdown.greenhouse_lever++;
      else if (src === "manual") platformBreakdown.manual++;
      else platformBreakdown.other++;
    });

    // Pipeline status distribution
    const statusDistribution: Record<string, number> = {
      wishlist: 0,
      applied: 0,
      screening: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
      archived: 0,
    };

    allApps.forEach((a) => {
      const st = a.status || "wishlist";
      statusDistribution[st] = (statusDistribution[st] || 0) + 1;
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalResumes,
        averageAtsScore: Math.round(atsAgg._avg.atsScore || 0),
        totalJobs,
        totalApplications,
        aiSearchesCount,
      },
      platformBreakdown,
      statusDistribution,
      recentUsers: recentUsers.map((u) => {
        let roles: string[] = [];
        try {
          if (u.profile?.targetRoles) roles = JSON.parse(u.profile.targetRoles);
        } catch {
          if (u.profile?.targetRoles) roles = [u.profile.targetRoles];
        }
        return {
          id: u.id,
          name: u.name || "Candidate",
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          atsScore: u.profile?.atsScore ?? null,
          location: u.profile?.location ?? null,
          targetRole: roles[0] || null,
          resumeFileName: u.profile?.resumeFileName ?? null,
          jobsCount: u._count.jobs,
          applicationsCount: u._count.applications,
        };
      }),
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
