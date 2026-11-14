import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const roleFilter = searchParams.get("role") || "all";

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: {
          select: {
            phone: true,
            location: true,
            targetRoles: true,
            jobType: true,
            skills: true,
            atsScore: true,
            resumeFileName: true,
            preferences: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            jobs: true,
            applications: true,
            activityLogs: true,
          },
        },
      },
    });

    const filtered = users
      .filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        if (!q) return true;

        const nameMatch = (u.name || "").toLowerCase().includes(q);
        const emailMatch = u.email.toLowerCase().includes(q);
        const locMatch = (u.profile?.location || "").toLowerCase().includes(q);
        const roleMatch = (u.profile?.targetRoles || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || locMatch || roleMatch;
      })
      .map((u) => {
        let roles: string[] = [];
        let skills: string[] = [];
        try {
          if (u.profile?.targetRoles) roles = JSON.parse(u.profile.targetRoles);
        } catch {
          if (u.profile?.targetRoles) roles = [u.profile.targetRoles];
        }
        try {
          if (u.profile?.skills) skills = JSON.parse(u.profile.skills);
        } catch {
          if (u.profile?.skills) skills = [u.profile.skills];
        }

        return {
          id: u.id,
          name: u.name || "Candidate",
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          phone: u.profile?.phone || null,
          location: u.profile?.location || null,
          targetRoles: roles,
          skills: skills.slice(0, 6),
          atsScore: u.profile?.atsScore ?? null,
          resumeFileName: u.profile?.resumeFileName ?? null,
          jobsCount: u._count.jobs,
          applicationsCount: u._count.applications,
          activityCount: u._count.activityLogs,
        };
      });

    return NextResponse.json({
      total: filtered.length,
      users: filtered,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to load candidates" }, { status: 500 });
  }
}
