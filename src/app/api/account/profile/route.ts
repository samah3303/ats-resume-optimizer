import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RESUME_DATA, ResumeData } from "@/lib/resume-templates";
import { extractFullStructuredResumeData } from "@/lib/resume-autofill";

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

    let parsedDraftData: ResumeData | null = null;
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
    if (skillsList.length === 0 && parsedDraftData?.skills && parsedDraftData.skills.length > 0) {
      skillsList = parsedDraftData.skills.flatMap((s) => s.skills || []);
    }

    // Summary
    let summary =
      onboardingProfile?.profileSummary ||
      parsedDraftData?.personalInfo?.summary ||
      "";

    // Experience
    let experience = parsedDraftData?.experiences || [];

    // Education
    let education = parsedDraftData?.education || [];

    // Projects
    let projects = parsedDraftData?.projects || [];

    // AUTO-POPULATION FALLBACK: If resume text exists but structured sections are empty, extract them now
    if (
      primaryResume?.parsedText &&
      primaryResume.parsedText.length > 50 &&
      (experience.length === 0 || skillsList.length === 0 || !summary)
    ) {
      try {
        const extracted = await extractFullStructuredResumeData(primaryResume.parsedText);

        if (extracted.summary && !summary) summary = extracted.summary;
        if (extracted.skills.length > 0 && skillsList.length === 0) skillsList = extracted.skills;
        if (extracted.experiences.length > 0 && experience.length === 0) experience = extracted.experiences;
        if (extracted.education.length > 0 && education.length === 0) education = extracted.education;
        if (extracted.projects.length > 0 && projects.length === 0) projects = extracted.projects;

        // Persist to ResumeDraft
        const newDraftData: ResumeData = {
          personalInfo: {
            fullName: session.user.name || "Candidate",
            headline: onboardingProfile?.targetPositions || "Professional",
            email: session.user.email || "",
            phone: "",
            location: onboardingProfile?.targetCountry || "United States",
            summary,
          },
          skills: [{ category: "Core Competencies", skills: skillsList }],
          experiences: experience,
          education,
          projects,
          certifications: [],
        };

        if (latestDraft) {
          await prisma.resumeDraft.update({
            where: { id: latestDraft.id },
            data: { dataJson: JSON.stringify(newDraftData) },
          });
        } else {
          await prisma.resumeDraft.create({
            data: {
              userId,
              title: primaryResume.name || "Primary Profile Draft",
              templateId: "classic-corporate",
              dataJson: JSON.stringify(newDraftData),
            },
          });
        }

        // Also update OnboardingProfile summary and skills if empty
        await prisma.onboardingProfile.upsert({
          where: { userId },
          update: {
            profileSummary: summary || undefined,
            coreSkills: skillsList.length > 0 ? JSON.stringify(skillsList) : undefined,
          },
          create: {
            userId,
            targetPositions: "Software Engineer",
            targetCountry: "United States",
            profileSummary: summary,
            coreSkills: JSON.stringify(skillsList),
            industry: "Technology / SaaS",
            jobType: "Full-time",
          },
        });
      } catch (extractErr) {
        console.warn("Auto-extraction in profile GET failed:", extractErr);
      }
    }

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
    const generalAtsScore = onboardingProfile?.generalAtsScore || 74;

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
