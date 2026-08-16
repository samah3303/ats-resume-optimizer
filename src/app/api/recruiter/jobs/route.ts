import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    // Ensure recruiter profile exists
    let profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.recruiterProfile.create({
        data: {
          userId,
          companyName: session.user.name ? `${session.user.name}'s Org` : "Talent Studio",
          role: "Lead Technical Recruiter",
        },
      });
    }

    // Fetch user's job postings
    let jobPostings = await prisma.jobPosting.findMany({
      where: { userId },
      include: {
        applications: {
          select: {
            id: true,
            stage: true,
            fitScore: true,
            candidateName: true,
            candidateEmail: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // If no jobs exist for this user, seed starter template postings with sample candidates
    if (jobPostings.length === 0) {
      const sampleJob1 = await prisma.jobPosting.create({
        data: {
          userId,
          title: "Senior Full-Stack AI Engineer",
          department: "Engineering",
          location: "San Francisco, CA (Hybrid)",
          jobType: "full-time",
          remotePolicy: "hybrid",
          salaryMin: 140000,
          salaryMax: 185000,
          currency: "USD",
          status: "active",
          description:
            "We are seeking a Senior Full-Stack AI Engineer to architect next-generation LLM workflows, React 19 web interfaces, and high-throughput vector search pipelines. You will collaborate directly with product leadership to ship autonomous career intelligence agents.",
          requirements:
            "5+ years TypeScript/React/Next.js experience. Solid understanding of LLM integration, embeddings, OpenAI API, PostgreSQL/pgvector, and scalable system design.",
        },
      });

      // Add sample candidates for sampleJob1
      await prisma.candidateApplication.createMany({
        data: [
          {
            jobPostingId: sampleJob1.id,
            candidateName: "Elena Vance",
            candidateEmail: "elena.vance@example.com",
            stage: "applied",
            fitScore: 92,
            fitSummary: "Strong full-stack portfolio with Next.js 15 and OpenAI API orchestration experience. Excellent system design background.",
            matchedSkills: JSON.stringify(["TypeScript", "Next.js", "PostgreSQL", "OpenAI API", "Tailwind CSS"]),
            missingSkills: JSON.stringify(["Kubernetes", "Redis"]),
            resumeText: "Senior Full-Stack Engineer with 6 years building distributed React/Node.js cloud apps. Engineered LLM evaluation benchmarks and deployed vector pipelines with PostgreSQL.",
            notes: "Referred by engineering lead. Available for interviews next week.",
          },
          {
            jobPostingId: sampleJob1.id,
            candidateName: "Marcus Sterling",
            candidateEmail: "marcus.sterling@example.com",
            stage: "screened",
            fitScore: 84,
            fitSummary: "Experienced React & Node.js developer with recent microservices work. Demonstrates strong problem solving.",
            matchedSkills: JSON.stringify(["React", "TypeScript", "Node.js", "REST APIs", "Prisma"]),
            missingSkills: JSON.stringify(["Vector Search", "Python"]),
            resumeText: "Full-Stack Software Developer. 5 years building scalable web applications with Next.js, GraphQL, and PostgreSQL.",
            notes: "Passed resume screening. High communication score.",
          },
          {
            jobPostingId: sampleJob1.id,
            candidateName: "Aaliyah Chen",
            candidateEmail: "aaliyah.chen@example.com",
            stage: "live_interview",
            fitScore: 96,
            fitSummary: "Exceptional candidate with deep expertise in AI agent architectures, Next.js App Router, and vector search embeddings.",
            matchedSkills: JSON.stringify(["Next.js", "TypeScript", "pgvector", "LangChain", "OpenAI", "Tailwind CSS"]),
            missingSkills: JSON.stringify([]),
            resumeText: "Staff Engineer & AI specialist. Built high-scale generative AI workflows serving 500k MAU. Lead contributor to open-source agent frameworks.",
            notes: "Completed Technical round with top ratings across system design.",
          },
          {
            jobPostingId: sampleJob1.id,
            candidateName: "David O'Connor",
            candidateEmail: "david.oc@example.com",
            stage: "offer",
            fitScore: 89,
            fitSummary: "Proven track record delivering reliable cloud infra and high-performance React frontends.",
            matchedSkills: JSON.stringify(["TypeScript", "React", "PostgreSQL", "Docker", "AWS"]),
            missingSkills: JSON.stringify(["pgvector"]),
            resumeText: "Senior Software Engineer with 7 years of full-stack experience in fintech and SaaS platforms.",
            notes: "Offer extended at $170,000 / yr. Awaiting response.",
          },
        ],
      });

      const sampleJob2 = await prisma.jobPosting.create({
        data: {
          userId,
          title: "Principal Product Designer",
          department: "Design & UX",
          location: "Remote",
          jobType: "full-time",
          remotePolicy: "remote",
          salaryMin: 130000,
          salaryMax: 165000,
          currency: "USD",
          status: "active",
          description:
            "Lead product design across our entire suite of AI career tools. You will define design systems, user journeys, micro-interactions, and visual storytelling.",
          requirements:
            "7+ years product design experience. Master of Figma, prototyping, tokenized design systems, and UX research. Experience in SaaS or AI tooling preferred.",
        },
      });

      await prisma.candidateApplication.createMany({
        data: [
          {
            jobPostingId: sampleJob2.id,
            candidateName: "Samantha Miller",
            candidateEmail: "samantha.m@example.com",
            stage: "screened",
            fitScore: 94,
            fitSummary: "Stunning portfolio with deep design systems and complex SaaS dashboard expertise.",
            matchedSkills: JSON.stringify(["Figma", "Design Systems", "User Research", "Prototyping", "Design Tokens"]),
            missingSkills: JSON.stringify([]),
            resumeText: "Lead Product Designer at HyperScale. Built universal design system adopted by 80+ engineers. Expert in dark mode & accessibility.",
          },
          {
            jobPostingId: sampleJob2.id,
            candidateName: "Lucas Rivera",
            candidateEmail: "lucas.rivera@example.com",
            stage: "hired",
            fitScore: 91,
            fitSummary: "Hired candidate with stellar UI execution and product vision.",
            matchedSkills: JSON.stringify(["Figma", "UI/UX", "Mobile First", "Design Systems"]),
            missingSkills: JSON.stringify([]),
            resumeText: "Senior UX Designer with 6 years designing award-winning web applications.",
          },
        ],
      });

      // Refetch job postings after seed
      jobPostings = await prisma.jobPosting.findMany({
        where: { userId },
        include: {
          applications: {
            select: {
              id: true,
              stage: true,
              fitScore: true,
              candidateName: true,
              candidateEmail: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Compute Metrics across all job postings
    let totalApplicants = 0;
    let screened = 0;
    let inInterview = 0;
    let hired = 0;
    let activePostings = 0;

    const interviewStages = new Set(["coding", "ai_interview", "live_interview"]);

    const jobsWithBreakdown = jobPostings.map((job) => {
      if (job.status === "active") activePostings++;

      const counts: Record<string, number> = {
        applied: 0,
        screened: 0,
        coding: 0,
        ai_interview: 0,
        live_interview: 0,
        offer: 0,
        hired: 0,
        rejected: 0,
      };

      for (const app of job.applications) {
        totalApplicants++;
        const s = app.stage || "applied";
        counts[s] = (counts[s] || 0) + 1;

        if (s === "screened" || app.fitScore !== null) screened++;
        if (interviewStages.has(s)) inInterview++;
        if (s === "hired") hired++;
      }

      return {
        id: job.id,
        title: job.title,
        department: job.department || "General",
        location: job.location,
        jobType: job.jobType,
        remotePolicy: job.remotePolicy,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        status: job.status,
        description: job.description,
        requirements: job.requirements,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        applicantCount: job.applications.length,
        stageBreakdown: {
          ...counts,
          total: job.applications.length,
        },
      };
    });

    // Recent applicants across all jobs
    const recentApplicants = await prisma.candidateApplication.findMany({
      where: {
        jobPosting: {
          userId,
        },
      },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
        scorecards: {
          select: {
            id: true,
            overallScore: true,
            recommendation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const formattedApplicants = recentApplicants.map((app) => ({
      id: app.id,
      jobPostingId: app.jobPostingId,
      jobTitle: app.jobPosting.title,
      department: app.jobPosting.department || "General",
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      resumeText: app.resumeText,
      stage: app.stage,
      fitScore: app.fitScore,
      fitSummary: app.fitSummary,
      matchedSkills: app.matchedSkills ? JSON.parse(app.matchedSkills) : [],
      missingSkills: app.missingSkills ? JSON.parse(app.missingSkills) : [],
      notes: app.notes,
      scorecardsCount: app.scorecards.length,
      createdAt: app.createdAt.toISOString(),
    }));

    return NextResponse.json({
      profile,
      stats: {
        activePostings,
        totalApplicants,
        screened,
        inInterview,
        hired,
      },
      jobs: jobsWithBreakdown,
      recentApplicants: formattedApplicants,
    });
  } catch (err) {
    console.error("Error fetching recruiter data:", err);
    return NextResponse.json(
      { error: "Failed to load recruiter command center data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Job title and description are required." },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosting.create({
      data: {
        userId,
        title: body.title.trim(),
        department: body.department?.trim() || "General",
        location: body.location?.trim() || "Remote",
        jobType: body.jobType || "full-time",
        remotePolicy: body.remotePolicy || "remote",
        salaryMin: body.salaryMin ? parseInt(body.salaryMin, 10) : null,
        salaryMax: body.salaryMax ? parseInt(body.salaryMax, 10) : null,
        currency: body.currency || "USD",
        description: body.description.trim(),
        requirements: body.requirements?.trim() || "",
        status: body.status || "active",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (err) {
    console.error("Error creating job posting:", err);
    return NextResponse.json(
      { error: "Failed to create job posting." },
      { status: 500 }
    );
  }
}
