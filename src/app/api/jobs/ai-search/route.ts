import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAiJobs } from "@/lib/job-matcher";
import { JobPreferences } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    let targetRoles: string[] = [];
    let skills: string[] = [];
    let experience: Array<{ title?: string; location?: string }> = [];

    if (profile?.targetRoles) {
      try {
        const parsed = JSON.parse(profile.targetRoles);
        targetRoles = Array.isArray(parsed) ? parsed : [profile.targetRoles];
      } catch {
        targetRoles = profile.targetRoles.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (profile?.skills) {
      try {
        const parsed = JSON.parse(profile.skills);
        skills = Array.isArray(parsed) ? parsed : [];
      } catch {
        skills = profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    if (profile?.experience) {
      try {
        const parsed = JSON.parse(profile.experience);
        experience = Array.isArray(parsed) ? parsed : [];
      } catch {
        experience = [];
      }
    }

    // Load saved job search preferences
    let prefs: JobPreferences = {};
    if (profile?.preferences) {
      try {
        prefs = JSON.parse(profile.preferences);
      } catch {
        prefs = {};
      }
    }

    const body = await request.json().catch(() => ({}));
    const customPrompt: string | undefined = body.prompt?.trim();
    const customLocation: string | undefined = body.location?.trim();

    // Location priority: Request override -> Saved Preferences -> Profile Location (from resume) -> Experience -> Remote
    const preferredLoc =
      customLocation ||
      (prefs.locations && prefs.locations.length > 0 ? prefs.locations[0] : null) ||
      profile?.location ||
      experience[0]?.location ||
      "Remote";

    // Role priority: Request override -> Target Roles -> Latest Resume Experience Title -> Professional
    const candidateRole =
      customPrompt ||
      targetRoles[0] ||
      experience[0]?.title ||
      "Professional";

    const formattedJobs = await fetchAiJobs({
      role: candidateRole,
      location: preferredLoc,
      skills,
      preferences: prefs,
      summary: profile?.summary,
    });

    // Log the AI search activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "ai_job_search",
        details: `Searched for "${candidateRole}" in ${preferredLoc} (${formattedJobs.length} matches found)`,
      },
    });

    return NextResponse.json({
      query: `${candidateRole} in ${preferredLoc}`,
      totalFound: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("AI job search error:", error);
    return NextResponse.json(
      { error: "Failed to search for jobs" },
      { status: 500 }
    );
  }
}
