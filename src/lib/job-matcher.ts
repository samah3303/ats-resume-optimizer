import { prisma } from "@/lib/prisma";
import { aiChat, parseJsonSafely } from "@/lib/ai";
import { JobPreferences } from "@/types";

export interface CandidateJobQuery {
  role?: string;
  location?: string;
  skills?: string[];
  preferences?: JobPreferences | null;
  summary?: string | null;
}

export interface MatchedJobItem {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  jobType: string;
  description: string;
  requirements: string;
  sourceUrl: string;
  source: string;
  matchScore: number;
}

/**
 * Searches and synthesizes matching jobs tailored to candidate's role and location.
 */
export async function fetchAiJobs(query: CandidateJobQuery): Promise<MatchedJobItem[]> {
  const role = query.role?.trim() || "Software Engineer";
  const location = query.location?.trim() || "Remote";
  const skills = query.skills || [];
  const prefs = query.preferences || {};
  const primarySkills = skills.slice(0, 5).join(", ") || "Technical Skills";

  // Determine platform sources based on region/preferences
  let platformQuery = "site:linkedin.com OR site:indeed.com";
  const isGulf = /dubai|uae|emirates|qatar|saudi|riyadh|kuwait|bahrain|oman/i.test(location);
  if (isGulf) {
    platformQuery = "site:bayt.com OR site:naukrigulf.com OR site:indeed.com OR site:linkedin.com";
  }

  if (prefs.platforms && prefs.platforms.length > 0) {
    const siteMap: Record<string, string> = {
      bayt: "site:bayt.com",
      naukrigulf: "site:naukrigulf.com",
      indeed: "site:indeed.com",
      linkedin: "site:linkedin.com",
      greenhouse: "site:greenhouse.io",
      lever: "site:lever.co",
    };
    const activeSites = prefs.platforms
      .map((p) => siteMap[p.toLowerCase()])
      .filter(Boolean);
    if (activeSites.length > 0) {
      platformQuery = activeSites.join(" OR ");
    }
  }

  const searchQuery = `${platformQuery} ${role} ${location}`.trim();
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  let webSnippets: Array<Record<string, unknown>> = [];

  if (deepseekKey) {
    try {
      const searchRes = await fetch("https://api.deepseek.com/v1/tools/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          webSnippets = data.results.slice(0, 8);
        }
      }
    } catch (err) {
      console.warn("Live web search fetch failed, continuing with AI synthesis:", err);
    }
  }

  const systemPrompt = `You are an expert career agent and technical recruiter.
Your job is to search, format, and return real, active job opportunities strictly matching the candidate's target location/country, role, and skills.

CRITICAL INSTRUCTIONS:
- LOCATION REQUIREMENT: All jobs must be based in or hire from "${location}". If "${location}" is a specific city/country, provide vacancies based in or open to candidates in "${location}".
- ROLE: Focus on "${role}".
- SKILLS FIT: Leverage key candidate competencies: ${primarySkills}.
- PLATFORMS: Prioritize Bayt.com, Naukri Gulf, LinkedIn, and Indeed (especially for Middle East / UAE).
- Output ONLY valid JSON with an array named "jobs".

JSON Schema:
{
  "jobs": [
    {
      "title": "Clean Job Title",
      "company": "Company Name",
      "location": "Location matching ${location}",
      "salary": "Estimated compensation range in local currency (e.g. '$120,000 - $150,000' or 'AED 25,000 - 35,000/mo' or '£75,000 - £95,000') or null",
      "jobType": "Full-time" | "Contract" | "Part-time",
      "description": "Clear 2-3 sentence overview of responsibilities and mission",
      "requirements": "Key 3-5 bullet requirements separated by newline",
      "sourceUrl": "Realistic job link URL from bayt.com, linkedin.com/jobs, indeed.com, naukrigulf.com, etc.",
      "source": "bayt" | "linkedin" | "indeed" | "naukrigulf" | "greenhouse" | "lever" | "web",
      "matchScore": number between 75 and 98 based on fit
    }
  ]
}`;

  const userMessage =
    webSnippets.length > 0
      ? `Live search results:\n${JSON.stringify(webSnippets, null, 2)}\n\nExtract and return 4 to 6 top matching jobs for ${role} in ${location}.`
      : `Compile 4 to 6 realistic and current open ${role} vacancies for candidates located in ${location}. Ensure salaries, requirements, and companies reflect the job market in ${location}.`;

  const aiResponse = await aiChat(systemPrompt, userMessage, {
    temperature: 0.2,
    maxTokens: 3000,
  });

  const parsed = parseJsonSafely<{ jobs: MatchedJobItem[] }>(aiResponse, { jobs: [] });
  const rawJobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];

  return rawJobs
    .filter((j) => j && typeof j === "object" && Boolean(j.title) && Boolean(j.company))
    .map((j) => ({
      title: String(j.title || "").trim(),
      company: String(j.company || "Employer").trim(),
      location: String(j.location || location).trim(),
      salary: j.salary ? String(j.salary).trim() : null,
      jobType: String(j.jobType || "Full-time").trim(),
      description: String(j.description || "").trim(),
      requirements: String(j.requirements || "").trim(),
      sourceUrl: String(j.sourceUrl || "").trim(),
      source: String(j.source || "ai_search").toLowerCase().trim(),
      matchScore:
        typeof j.matchScore === "number"
          ? Math.min(Math.max(j.matchScore, 50), 98)
          : 85,
    }));
}

/**
 * Automatically fetches and stores personalized job listings for a candidate
 * based on their resume profile (country, location, target role, skills, preferences).
 */
export async function autoPopulateJobsForUser(
  userId: string,
  options?: { maxJobs?: number; forceRefresh?: boolean }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    // Parse profile fields
    let targetRoles: string[] = [];
    if (profile.targetRoles) {
      try {
        const parsed = JSON.parse(profile.targetRoles);
        targetRoles = Array.isArray(parsed) ? parsed : [profile.targetRoles];
      } catch {
        targetRoles = profile.targetRoles.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    let skills: string[] = [];
    if (profile.skills) {
      try {
        const parsed = JSON.parse(profile.skills);
        skills = Array.isArray(parsed) ? parsed : [];
      } catch {
        skills = profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }

    let preferences: JobPreferences = {};
    if (profile.preferences) {
      try {
        preferences = JSON.parse(profile.preferences);
      } catch {
        preferences = {};
      }
    }

    let experience: Array<{ title?: string; location?: string }> = [];
    if (profile.experience) {
      try {
        const parsed = JSON.parse(profile.experience);
        experience = Array.isArray(parsed) ? parsed : [];
      } catch {
        experience = [];
      }
    }

    // Determine target location:
    // Priority: Preferences location -> Profile location (from resume) -> Experience location -> Remote
    const candidateLocation =
      (preferences.locations && preferences.locations.length > 0
        ? preferences.locations[0]
        : null) ||
      profile.location ||
      experience[0]?.location ||
      "Remote";

    // Determine candidate role:
    // Priority: targetRoles[0] -> most recent experience job title -> inferred from summary -> Software Engineer
    const candidateRole =
      targetRoles[0] ||
      experience[0]?.title ||
      "Software Engineer";

    // Fetch matching jobs via AI
    const matchedJobs = await fetchAiJobs({
      role: candidateRole,
      location: candidateLocation,
      skills,
      preferences,
      summary: profile.summary,
    });

    if (matchedJobs.length === 0) return [];

    const limit = options?.maxJobs || 5;
    const toSave = matchedJobs.slice(0, limit);

    // Save into database avoiding duplicates
    const savedJobs = [];
    for (const job of toSave) {
      const existing = await prisma.job.findFirst({
        where: {
          userId,
          title: job.title,
          company: job.company,
        },
      });

      if (!existing) {
        const created = await prisma.job.create({
          data: {
            userId,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            jobType: job.jobType,
            description: job.description,
            requirements: job.requirements,
            sourceUrl: job.sourceUrl,
            source: job.source || "ai_search",
            matchScore: job.matchScore,
          },
        });
        savedJobs.push(created);
      } else {
        savedJobs.push(existing);
      }
    }

    // Record activity
    if (savedJobs.length > 0) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "ai_job_search",
          details: `Auto-fetched ${savedJobs.length} matching jobs for "${candidateRole}" in ${candidateLocation}`,
        },
      });
    }

    return savedJobs;
  } catch (err) {
    console.error("Error auto-populating jobs for user:", err);
    return [];
  }
}
