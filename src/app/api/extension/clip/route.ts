import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApplicationStatus } from "@/types";

/**
 * Multi-Factor ATS Match Score Algorithm
 * Evaluates Role/Seniority alignment, skills coverage from job description,
 * and candidate resume depth.
 */
function calculateIntelligentAtsScore({
  title,
  company,
  description,
  requirements,
  profile,
}: {
  title: string;
  company?: string | null;
  description?: string | null;
  requirements?: string | null;
  profile: {
    skills?: string | null;
    targetRoles?: string | null;
    experience?: string | null;
    summary?: string | null;
    resumeText?: string | null;
    atsScore?: number | null;
  } | null;
}): { score: number; matchedSkills: string[]; missingSkills: string[] } {
  // If no profile at all, return reasonable default
  if (!profile) {
    return { score: 78, matchedSkills: [], missingSkills: [] };
  }

  // 1. Parse candidate data
  let candidateSkills: string[] = [];
  try {
    if (profile.skills) {
      const parsed = JSON.parse(profile.skills);
      if (Array.isArray(parsed)) {
        candidateSkills = parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    }
  } catch {}

  let targetRoles: string[] = [];
  try {
    if (profile.targetRoles) {
      const parsed = JSON.parse(profile.targetRoles);
      if (Array.isArray(parsed)) {
        targetRoles = parsed.map((r) => String(r).trim().toLowerCase()).filter(Boolean);
      } else if (typeof parsed === "string") {
        targetRoles = [parsed.toLowerCase()];
      }
    }
  } catch {
    if (profile.targetRoles) {
      targetRoles = [profile.targetRoles.toLowerCase()];
    }
  }

  const jobTitleLower = (title || "").toLowerCase();
  const jobDescText = [description, requirements].filter(Boolean).join(" ").toLowerCase();
  const fullJobCorpus = `${jobTitleLower} ${company || ""} ${jobDescText}`.toLowerCase();
  const candidateCorpus = [
    profile.resumeText,
    profile.summary,
    profile.experience,
    candidateSkills.join(" "),
    targetRoles.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // -------------------------------------------------------------------------
  // FACTOR A: Title & Role Alignment (0 - 35 points)
  // -------------------------------------------------------------------------
  let rolePoints = 15; // baseline

  // Clean title tokens
  const titleTokens = jobTitleLower
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !["and", "the", "for", "with", "opening", "confidential", "job"].includes(w)
    );

  // Check direct match with targetRoles
  const matchesTargetRole = targetRoles.some((tr) => {
    return tr.includes(jobTitleLower) || jobTitleLower.includes(tr) ||
      titleTokens.some((tok) => tr.includes(tok));
  });

  if (matchesTargetRole) {
    rolePoints = 32;
  } else {
    // Check overlap of title tokens in candidate corpus
    const matchedTokens = titleTokens.filter((tok) => candidateCorpus.includes(tok));
    const tokenRatio = titleTokens.length > 0 ? matchedTokens.length / titleTokens.length : 0.5;
    if (tokenRatio >= 0.7) {
      rolePoints = 30;
    } else if (tokenRatio >= 0.4) {
      rolePoints = 25;
    } else if (tokenRatio > 0) {
      rolePoints = 20;
    } else {
      rolePoints = 12;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR B: Skills Coverage (0 - 45 points)
  // -------------------------------------------------------------------------
  let skillsPoints = 25;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const s of candidateSkills) {
    const sLower = s.toLowerCase();
    if (fullJobCorpus.includes(sLower)) {
      matchedSkills.push(s);
    }
  }

  // List of high-frequency industry skills to check if mentioned in job but missing from candidate
  const commonTechSkills = [
    "php", "laravel", "python", "javascript", "typescript", "react", "next.js", "vue",
    "node.js", "angular", "java", "spring", "c#", ".net", "golang", "rust", "c++",
    "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sql", "nosql",
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "terraform", "git",
    "rest api", "graphql", "microservices", "kafka", "rabbitmq", "tailwind",
    "agile", "scrum", "jira", "unit testing", "jest", "cypress", "ai", "machine learning"
  ];

  for (const kw of commonTechSkills) {
    if (fullJobCorpus.includes(kw)) {
      const hasSkill = candidateSkills.some((s) => s.toLowerCase() === kw || s.toLowerCase().includes(kw));
      if (!hasSkill && !missingSkills.includes(kw)) {
        missingSkills.push(kw);
      }
    }
  }

  if (matchedSkills.length >= 7) {
    skillsPoints = 44;
  } else if (matchedSkills.length >= 5) {
    skillsPoints = 41;
  } else if (matchedSkills.length >= 3) {
    skillsPoints = 37;
  } else if (matchedSkills.length >= 2) {
    skillsPoints = 32;
  } else if (matchedSkills.length === 1) {
    skillsPoints = 27;
  } else {
    // If no explicit skill tag matched, check if keywords from job exist in resume text
    const foundKeywordsCount = commonTechSkills.filter(
      (kw) => fullJobCorpus.includes(kw) && candidateCorpus.includes(kw)
    ).length;
    if (foundKeywordsCount >= 3) {
      skillsPoints = 34;
    } else if (foundKeywordsCount >= 1) {
      skillsPoints = 26;
    } else {
      skillsPoints = 18;
    }
  }

  // -------------------------------------------------------------------------
  // FACTOR C: Experience & Profile Baseline (0 - 20 points)
  // -------------------------------------------------------------------------
  let expPoints = 14;

  if (typeof profile.atsScore === "number" && profile.atsScore > 0) {
    // Scale existing profile ATS score into 13-18 points
    expPoints = Math.round(13 + (profile.atsScore / 100) * 5);
  }

  // Seniority alignment bonus
  const isSeniorJob = /senior|lead|principal|staff|head|manager|architect|6\+|7\+|8\+|10\+/i.test(jobTitleLower) ||
    /minimum 5\+|minimum 6\+|6\+ years|7\+ years|8\+ years/i.test(jobDescText);
  const isSeniorCandidate = /senior|lead|principal|staff|years of experience|8 years|7 years|6 years/i.test(candidateCorpus);

  if (isSeniorJob && isSeniorCandidate) {
    expPoints += 2;
  } else if (!isSeniorJob && !isSeniorCandidate) {
    expPoints += 2;
  }

  // Final Total Score Clamped
  const rawScore = rolePoints + skillsPoints + expPoints;
  const score = Math.min(Math.max(Math.round(rawScore), 58), 97);

  return { score, matchedSkills, missingSkills: missingSkills.slice(0, 6) };
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate via Bearer token or session
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const user = await prisma.user.findUnique({
        where: { apiToken: token },
        select: { id: true },
      });
      if (user) userId = user.id;
    }

    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as { id: string }).id) {
        userId = (session.user as { id: string }).id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log into paniund or provide an API token." },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json(
        { error: "Job title is required." },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const title = String(body.title).trim();
    const company = body.company ? String(body.company).trim() : "Unknown Employer";
    const location = body.location ? String(body.location).trim() : null;
    const salary = body.salary ? String(body.salary).trim() : null;
    const jobType = body.jobType ? String(body.jobType).trim() : null;
    const description = body.description ? String(body.description).trim() : null;
    const requirements = body.requirements ? String(body.requirements).trim() : null;
    const sourceUrl = body.sourceUrl ? String(body.sourceUrl).trim() : null;
    const source = body.source ? String(body.source).toLowerCase().trim() : "extension";
    const requestedStatus: ApplicationStatus =
      body.status === "applied" ? "applied" : "wishlist";

    // Fetch user profile with full context
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        skills: true,
        targetRoles: true,
        experience: true,
        summary: true,
        resumeText: true,
        atsScore: true,
      },
    });

    // Compute realistic ATS match score
    const atsResult = calculateIntelligentAtsScore({
      title,
      company,
      description,
      requirements,
      profile,
    });
    const matchScore = atsResult.score;

    // Check if job already exists for this user by sourceUrl or (title + company)
    let job = null;
    if (sourceUrl) {
      job = await prisma.job.findFirst({
        where: { userId, sourceUrl },
      });
    }

    if (!job) {
      job = await prisma.job.findFirst({
        where: { userId, title, company },
      });
    }

    if (job) {
      // Update existing job with any freshly scraped description/salary
      job = await prisma.job.update({
        where: { id: job.id },
        data: {
          location: location || job.location,
          salary: salary || job.salary,
          description: description || job.description,
          requirements: requirements || job.requirements,
          matchScore: matchScore || job.matchScore,
        },
      });
    } else {
      // Create new job
      job = await prisma.job.create({
        data: {
          userId,
          title,
          company,
          location,
          salary,
          jobType,
          description,
          requirements,
          sourceUrl,
          source,
          matchScore,
        },
      });
    }

    // Ensure linked application exists in the requested status
    let application = await prisma.application.findFirst({
      where: { userId, jobId: job.id },
    });

    if (!application) {
      const now = new Date();
      application = await prisma.application.create({
        data: {
          userId,
          jobId: job.id,
          status: requestedStatus,
          appliedAt: requestedStatus === "applied" ? now : null,
          statusHistory: JSON.stringify([
            {
              from: null,
              to: requestedStatus,
              date: now.toISOString(),
              note: `Clipped from ${source}`,
            },
          ]),
          atsScore: matchScore,
        },
      });
    } else if (requestedStatus === "applied" && application.status === "wishlist") {
      // Upgrade from wishlist to applied if user checked "applied"
      const now = new Date();
      let history: any[] = [];
      try {
        history = JSON.parse(application.statusHistory || "[]");
      } catch {}
      history.push({
        from: "wishlist",
        to: "applied",
        date: now.toISOString(),
        note: "Updated via browser extension",
      });

      application = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: "applied",
          appliedAt: now,
          statusHistory: JSON.stringify(history),
          atsScore: matchScore,
        },
      });
    }

    // Log user activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "job_clipped",
        details: `Clipped "${title}" at ${company} from ${source} (ATS Match: ${matchScore}%)`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        jobId: job.id,
        applicationId: application.id,
        title: job.title,
        company: job.company,
        location: job.location,
        matchScore: job.matchScore,
        matchedSkills: atsResult.matchedSkills,
        missingSkills: atsResult.missingSkills,
        status: application.status,
        dashboardUrl: `/dashboard/jobs/${job.id}`,
        message: `Successfully saved "${job.title}" to your pipeline!`,
      },
      {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Extension clip error:", error);
    return NextResponse.json(
      { error: "Failed to save clipped job." },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
