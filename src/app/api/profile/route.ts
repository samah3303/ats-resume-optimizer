import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

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
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;

    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true },
      }),
      prisma.profile.findUnique({
        where: { userId },
      }),
    ]);

    if (!profile) {
      return apiSuccess({
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

    return apiSuccess({
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
    return handleApiError(error, "Failed to fetch profile");
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return apiError("Invalid JSON body", 400);
    }

    // Schema validation and XSS sanitization
    const validated = updateProfileSchema.parse(rawBody);

    // Update user name if provided
    if (validated.name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: validated.name || null },
      });
    }

    // Build profile update data
    const profileUpdate: Record<string, unknown> = {};
    if (validated.phone !== undefined) profileUpdate.phone = validated.phone;
    if (validated.location !== undefined) profileUpdate.location = validated.location;
    if (validated.targetRoles !== undefined)
      profileUpdate.targetRoles = JSON.stringify(validated.targetRoles);
    if (validated.jobType !== undefined) profileUpdate.jobType = validated.jobType;
    if (validated.linkedinUrl !== undefined)
      profileUpdate.linkedinUrl = validated.linkedinUrl;
    if (validated.portfolioUrl !== undefined)
      profileUpdate.portfolioUrl = validated.portfolioUrl;
    if (validated.githubUrl !== undefined) profileUpdate.githubUrl = validated.githubUrl;
    if (validated.skills !== undefined) profileUpdate.skills = JSON.stringify(validated.skills);
    if (validated.experience !== undefined) profileUpdate.experience = JSON.stringify(validated.experience);
    if (validated.education !== undefined) profileUpdate.education = JSON.stringify(validated.education);
    if (validated.summary !== undefined) profileUpdate.summary = validated.summary;
    if (validated.preferences !== undefined)
      profileUpdate.preferences = validated.preferences ? JSON.stringify(validated.preferences) : null;
    if (validated.onboardingDone !== undefined)
      profileUpdate.onboardingDone = validated.onboardingDone;

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileUpdate,
      },
      update: profileUpdate,
    });

    return apiSuccess({
      id: userId,
      phone: profile.phone,
      location: profile.location,
      targetRoles: safeParse(profile.targetRoles, []),
      jobType: profile.jobType,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      githubUrl: profile.githubUrl,
      skills: safeParse(profile.skills, []),
      experience: safeParse(profile.experience, []),
      education: safeParse(profile.education, []),
      summary: profile.summary,
      preferences: safeParse(profile.preferences, null),
      onboardingDone: profile.onboardingDone,
    });
  } catch (error) {
    return handleApiError(error, "Failed to update profile");
  }
}
