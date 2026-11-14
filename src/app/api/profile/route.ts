import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function safeParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({
        id: userId,
        name: user?.name || null,
        email: user?.email || "",
        phone: null,
        location: null,
        targetRoles: [],
        jobType: null,
        linkedinUrl: null,
        portfolioUrl: null,
        githubUrl: null,
        skills: [],
        experience: [],
        education: [],
        summary: null,
        atsScore: null,
        atsBreakdown: null,
        recommendations: [],
        onboardingDone: false,
      });
    }

    return NextResponse.json({
      id: userId,
      name: user?.name || null,
      email: user?.email || "",
      phone: profile.phone,
      location: profile.location,
      targetRoles: safeParse(profile.targetRoles, typeof profile.targetRoles === "string" ? profile.targetRoles.split(",").map(s => s.trim()).filter(Boolean) : []),
      jobType: profile.jobType,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      githubUrl: profile.githubUrl,
      skills: safeParse(profile.skills, []),
      experience: safeParse(profile.experience, []),
      education: safeParse(profile.education, []),
      summary: profile.summary,
      atsScore: profile.atsScore,
      atsBreakdown: safeParse(profile.atsBreakdown, null),
      recommendations: safeParse(profile.recommendations, []),
      preferences: safeParse(profile.preferences, null),
      onboardingDone: profile.onboardingDone,
      resumeFileName: profile.resumeFileName,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const {
      name,
      phone,
      location,
      targetRoles,
      jobType,
      linkedinUrl,
      portfolioUrl,
      githubUrl,
      skills,
      experience,
      education,
      summary,
      preferences,
      onboardingDone,
    } = body as {
      name?: string;
      phone?: string;
      location?: string;
      targetRoles?: string[];
      jobType?: string;
      linkedinUrl?: string;
      portfolioUrl?: string;
      githubUrl?: string;
      skills?: string[];
      experience?: unknown[];
      education?: unknown[];
      summary?: string;
      preferences?: Record<string, unknown> | null;
      onboardingDone?: boolean;
    };

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: name.trim() || null },
      });
    }

    // Build profile update data — only include fields that were sent
    const profileUpdate: Record<string, unknown> = {};
    if (phone !== undefined) profileUpdate.phone = phone || null;
    if (location !== undefined) profileUpdate.location = location || null;
    if (targetRoles !== undefined)
      profileUpdate.targetRoles = JSON.stringify(targetRoles);
    if (jobType !== undefined) profileUpdate.jobType = jobType || null;
    if (linkedinUrl !== undefined)
      profileUpdate.linkedinUrl = linkedinUrl || null;
    if (portfolioUrl !== undefined)
      profileUpdate.portfolioUrl = portfolioUrl || null;
    if (githubUrl !== undefined) profileUpdate.githubUrl = githubUrl || null;
    if (skills !== undefined) profileUpdate.skills = JSON.stringify(skills);
    if (experience !== undefined) profileUpdate.experience = JSON.stringify(experience);
    if (education !== undefined) profileUpdate.education = JSON.stringify(education);
    if (summary !== undefined) profileUpdate.summary = summary || null;
    if (preferences !== undefined)
      profileUpdate.preferences = preferences ? JSON.stringify(preferences) : null;
    if (onboardingDone !== undefined)
      profileUpdate.onboardingDone = onboardingDone;

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileUpdate,
      },
      update: profileUpdate,
    });

    return NextResponse.json({
      id: userId,
      phone: profile.phone,
      location: profile.location,
      targetRoles: profile.targetRoles ? JSON.parse(profile.targetRoles) : [],
      jobType: profile.jobType,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      githubUrl: profile.githubUrl,
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      experience: profile.experience ? JSON.parse(profile.experience) : [],
      education: profile.education ? JSON.parse(profile.education) : [],
      summary: profile.summary,
      preferences: profile.preferences ? JSON.parse(profile.preferences) : null,
      onboardingDone: profile.onboardingDone,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
