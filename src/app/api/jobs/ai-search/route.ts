import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiChat, parseJsonSafely } from "@/lib/ai";

interface SearchResultItem {
  title?: string;
  url?: string;
  site_name?: string;
  snippet?: string;
  summary?: string;
}

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

    // Load saved job search preferences
    let prefs: {
      locations?: string[];
      workModes?: string[];
      employmentTypes?: string[];
      platforms?: string[];
      minSalary?: string;
      experienceLevel?: string;
      keywords?: string[];
    } = {};

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

    const candidateRole = targetRoles[0] || "Software Engineer";
    const primarySkills = skills.slice(0, 4).join(" ") || "TypeScript React";

    // Location priority: Request override -> Saved Preferences -> Profile Location -> Default
    const preferredLoc =
      customLocation ||
      (prefs.locations && prefs.locations.length > 0 ? prefs.locations.join(" OR ") : null) ||
      profile?.location ||
      "Dubai, UAE or Remote";

    // Platforms priority: Saved Preferences -> Default (Naukri Gulf, Indeed, LinkedIn)
    let platformSites = "site:naukrigulf.com OR site:indeed.com OR site:linkedin.com";
    if (prefs.platforms && prefs.platforms.length > 0) {
      const siteMap: Record<string, string> = {
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
        platformSites = activeSites.join(" OR ");
      }
    }

    // Additional preference keywords
    const extraKeywords =
      prefs.keywords && prefs.keywords.length > 0
        ? prefs.keywords.slice(0, 3).join(" ")
        : "";

    // 1. Build targeted search query
    let searchQuery = "";
    if (customPrompt) {
      searchQuery = `${platformSites} ${customPrompt}`;
    } else {
      searchQuery = `${platformSites} ${candidateRole} ${extraKeywords || primarySkills} ${preferredLoc}`.trim();
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    let searchResults: SearchResultItem[] = [];

    if (deepseekKey) {
      try {
        let searchRes = await fetch("https://api.deepseek.com/v1/tools/search", {
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
            searchResults = data.results.slice(0, 10);
          }
        }

        // Fallback retry with broader terms if 0 results
        if (searchResults.length === 0) {
          const broadQuery = `naukrigulf indeed ${candidateRole} ${preferredLoc} jobs`;
          searchRes = await fetch("https://api.deepseek.com/v1/tools/search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${deepseekKey}`,
            },
            body: JSON.stringify({ query: broadQuery }),
          });
          if (searchRes.ok) {
            const data = await searchRes.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              searchResults = data.results.slice(0, 10);
            }
          }
        }
      } catch (searchErr) {
        console.error("DeepSeek web search fetch failed:", searchErr);
      }
    }

    // 2. Synthesize & structure jobs using DeepSeek AI
    const systemPrompt = `You are an expert career agent and technical recruiter.
Your job is to parse and format open job vacancies found from major job platforms including Naukri Gulf, Indeed, LinkedIn, Greenhouse, and Lever.
Prioritize jobs aligning closely with the candidate's stated preferences. Output strict JSON with an array named "jobs".

Candidate Profile & Saved Preferences:
- Target Roles: ${targetRoles.join(", ") || candidateRole}
- Skills: ${skills.join(", ") || primarySkills}
- Preferred Locations: ${preferredLoc}
${prefs.workModes && prefs.workModes.length > 0 ? `- Desired Work Modes: ${prefs.workModes.join(", ")}` : ""}
${prefs.minSalary ? `- Minimum Desired Salary: ${prefs.minSalary}` : ""}
${prefs.experienceLevel ? `- Experience Level: ${prefs.experienceLevel}` : ""}
${prefs.keywords && prefs.keywords.length > 0 ? `- Must-have Keywords: ${prefs.keywords.join(", ")}` : ""}
${profile?.summary ? `- Summary: ${profile.summary.slice(0, 300)}` : ""}

For each job found, provide:
{
  "title": "Clean Job Title",
  "company": "Company Name",
  "location": "Location (e.g. Dubai, UAE, or Remote)",
  "salary": "Salary or range if mentioned, e.g. '$130,000 - $160,000' or 'AED 25,000 - 35,000/month', or null",
  "jobType": "Full-time" or "Contract" or "Part-time",
  "description": "Clear 2-3 sentence summary of the role and responsibilities",
  "requirements": "Key 3-5 bullet requirements separated by newline",
  "sourceUrl": "Direct valid URL to job posting (e.g. from naukrigulf.com, indeed.com, etc.)",
  "source": "naukrigulf" | "indeed" | "linkedin" | "greenhouse" | "lever" | "web",
  "matchScore": number between 65 and 97 based on fit with candidate's skills and preferences
}

Respond ONLY with valid JSON in this format:
{
  "jobs": [...]
}`;

    const userMessage = searchResults.length > 0
      ? `Here are the live search results from Naukri Gulf, Indeed, LinkedIn, and other job portals:\n\n${JSON.stringify(searchResults, null, 2)}\n\nExtract and return the top 4 to 8 best matching jobs for the candidate.`
      : `Search and compile 4 to 6 real-world open ${candidateRole} vacancies from Naukri Gulf, Indeed, and modern tech job boards matching: ${searchQuery}. Include realistic requirements, company names, and direct platform URLs.`;

    const aiResponse = await aiChat(systemPrompt, userMessage, {
      temperature: 0.2,
      maxTokens: 3500,
    });

    const parsedData = parseJsonSafely<{ jobs: Array<Record<string, unknown>> }>(aiResponse, { jobs: [] });
    const formattedJobs = (Array.isArray(parsedData.jobs) ? parsedData.jobs : [])
      .filter((j) => j && typeof j === "object" && Boolean(j.title) && Boolean(j.company) && Boolean(j.description))
      .map((j) => ({
        title: String(j.title || "").trim(),
        company: String(j.company || "Tech Employer").trim(),
        location: String(j.location || preferredLoc || "Remote").trim(),
        salary: j.salary ? String(j.salary).trim() : null,
        jobType: String(j.jobType || "Full-time").trim(),
        description: String(j.description || "").trim(),
        requirements: String(j.requirements || "").trim(),
        sourceUrl: String(j.sourceUrl || "").trim(),
        source: String(j.source || "web").toLowerCase().trim(),
        matchScore: typeof j.matchScore === "number" ? Math.min(Math.max(j.matchScore, 50), 98) : 85,
      }));

    // Log the AI search activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "ai_job_search",
        details: `Searched Naukri Gulf, Indeed & LinkedIn for "${candidateRole}" (${formattedJobs.length} matches found)`,
      },
    });

    return NextResponse.json({
      query: searchQuery,
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
