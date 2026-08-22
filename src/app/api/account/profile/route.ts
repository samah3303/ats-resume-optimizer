import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RESUME_DATA, ResumeData } from "@/lib/resume-templates";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const [onboardingProfile, primaryResume, latestDraft] = await Promise.all([
      prisma.onboardingProfile.findUnique({ where: { userId } }),
      prisma.resume.findFirst({
        where: { userId, isPrimary: true },
        orderBy: { updatedAt: "desc" },
      }) || prisma.resume.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      prisma.resumeDraft.findFirst({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    let parsedDraftData: ResumeData = DEFAULT_RESUME_DATA;
    if (latestDraft?.dataJson) {
      try {
        parsedDraftData = JSON.parse(latestDraft.dataJson);
      } catch {}
    }

    // Parse core skills safely
    let skillsList: string[] = [];
    if (onboardingProfile?.coreSkills) {
      try {
        const parsed = JSON.parse(onboardingProfile.coreSkills);
        skillsList = Array.isArray(parsed) ? parsed : [];
      } catch {}
    }
    if (skillsList.length === 0 && parsedDraftData.skills?.length > 0) {
      skillsList = parsedDraftData.skills.flatMap((s) => s.skills || []);
    }

    // Summary
    const summary =
      onboardingProfile?.profileSummary ||
      parsedDraftData.personalInfo?.summary ||
      "";

    // Experience
    const experience = parsedDraftData.experiences || [];

    // Education
    const education = parsedDraftData.education || [];

    // Projects
    const projects = parsedDraftData.projects || [];

    // Calculate completeness score (0-100%)
    let completeness = 20; // Base for creating account
    if (onboardingProfile?.targetPositions) completeness += 20;
    if (onboardingProfile?.targetCountry) completeness += 10;
    if (summary && summary.length > 30) completeness += 15;
    if (skillsList.length >= 3) completeness += 15;
    if (experience.length > 0) completeness += 10;
    if (education.length > 0) completeness += 10;
    completeness = Math.min(100, completeness);

    // ATS Score
    const generalAtsScore = onboardingProfile?.generalAtsScore || 72;

    // Market gaps and improvements
    let marketGaps: any[] = [];
    let resumeImprovements: any[] = [];
    if (onboardingProfile?.marketGaps) {
      try {
        marketGaps = JSON.parse(onboardingProfile.marketGaps);
      } catch {}
    }
    if (onboardingProfile?.resumeImprovements) {
      try {
        resumeImprovements = JSON.parse(onboardingProfile.resumeImprovements);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      onboardingProfile,
      resumeName: primaryResume?.name || "Primary Resume",
      generalAtsScore,
      completeness,
      summary,
      skills: skillsList,
      experience,
      education,
      projects,
      targetPositions: onboardingProfile?.targetPositions || "",
      targetCountry: onboardingProfile?.targetCountry || "United States",
      industry: onboardingProfile?.industry || "Technology / SaaS",
      jobType: onboardingProfile?.jobType || "Full-time",
      marketGaps,
      resumeImprovements,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch candidate profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const {
      summary,
      skills,
      experience,
      education,
      projects,
      targetPositions,
      targetCountry,
      industry,
      jobType,
    } = body;

    // 1. Update Onboarding Profile
    const updatedProfile = await prisma.onboardingProfile.upsert({
      where: { userId },
      update: {
        profileSummary: summary ?? undefined,
        coreSkills: skills ? JSON.stringify(skills) : undefined,
        targetPositions: targetPositions ?? undefined,
        targetCountry: targetCountry ?? undefined,
        industry: industry ?? undefined,
        jobType: jobType ?? undefined,
      },
      create: {
        userId,
        targetPositions: targetPositions || "Software Engineer",
        targetCountry: targetCountry || "United States",
        profileSummary: summary || "",
        coreSkills: JSON.stringify(skills || []),
        industry: industry || "Technology / SaaS",
        jobType: jobType || "Full-time",
      },
    });

    // 2. Sync with latest ResumeDraft
    const latestDraft = await prisma.resumeDraft.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    let currentDraftData: ResumeData = DEFAULT_RESUME_DATA;
    if (latestDraft?.dataJson) {
      try {
        currentDraftData = JSON.parse(latestDraft.dataJson);
      } catch {}
    }

    const mergedDraftData: ResumeData = {
      ...currentDraftData,
      personalInfo: {
        ...currentDraftData.personalInfo,
        summary: summary !== undefined ? summary : currentDraftData.personalInfo?.summary || "",
      },
      skills: skills
        ? [{ category: "Core Competencies", skills }]
        : currentDraftData.skills,
      experiences: experience !== undefined ? experience : currentDraftData.experiences,
      education: education !== undefined ? education : currentDraftData.education,
      projects: projects !== undefined ? projects : currentDraftData.projects,
    };

    if (latestDraft) {
      await prisma.resumeDraft.update({
        where: { id: latestDraft.id },
        data: {
          dataJson: JSON.stringify(mergedDraftData),
        },
      });
    } else {
      await prisma.resumeDraft.create({
        data: {
          userId,
          title: "Primary Profile Draft",
          templateId: "classic-corporate",
          dataJson: JSON.stringify(mergedDraftData),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
