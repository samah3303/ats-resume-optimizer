import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screenCandidateResume } from "@/lib/ai/recruiter";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            scorecards: {
              include: {
                reviewer: {
                  select: { name: true, email: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const formattedApplications = job.applications.map((app) => ({
      id: app.id,
      jobPostingId: app.jobPostingId,
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      resumeText: app.resumeText,
      stage: app.stage,
      fitScore: app.fitScore,
      fitSummary: app.fitSummary,
      matchedSkills: app.matchedSkills ? JSON.parse(app.matchedSkills) : [],
      missingSkills: app.missingSkills ? JSON.parse(app.missingSkills) : [],
      notes: app.notes,
      scorecards: app.scorecards.map((sc) => ({
        id: sc.id,
        stage: sc.stage,
        overallScore: sc.overallScore,
        criteria: sc.criteriaJson ? JSON.parse(sc.criteriaJson) : {},
        feedback: sc.feedback,
        recommendation: sc.recommendation,
        reviewerName: sc.reviewer.name || sc.reviewer.email,
        createdAt: sc.createdAt.toISOString(),
      })),
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        department: job.department || "General",
        location: job.location,
        jobType: job.jobType,
        remotePolicy: job.remotePolicy,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        totalApplicants: formattedApplications.length,
      },
      applications: formattedApplications,
    });
  } catch (err) {
    console.error("Error fetching pipeline data:", err);
    return NextResponse.json(
      { error: "Failed to fetch candidate pipeline." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const body = await req.json();

    if (!body.candidateName || !body.candidateEmail) {
      return NextResponse.json(
        { error: "Candidate name and email are required." },
        { status: 400 }
      );
    }

    const resumeText = body.resumeText?.trim() || "Candidate resume not provided.";
    let fitScore = body.fitScore !== undefined ? parseInt(body.fitScore, 10) : null;
    let fitSummary = body.fitSummary || null;
    let matchedSkills = body.matchedSkills || [];
    let missingSkills = body.missingSkills || [];

    // Auto AI Screen if resumeText is provided and no fitScore
    if (resumeText.length > 50 && fitScore === null) {
      try {
        const screenResult = await screenCandidateResume(
          resumeText,
          job.title,
          `Title: ${job.title}\n\nJob Description:\n${job.description}\n\nRequirements:\n${job.requirements}`,
          userId
        );
        fitScore = screenResult.fitScore;
        fitSummary = screenResult.fitSummary;
        matchedSkills = screenResult.matchedSkills;
        missingSkills = screenResult.missingSkills;
      } catch (err) {
        console.warn("Auto-screening failed, proceeding with basic candidate:", err);
      }
    }

    const application = await prisma.candidateApplication.create({
      data: {
        jobPostingId: id,
        candidateName: body.candidateName.trim(),
        candidateEmail: body.candidateEmail.trim(),
        resumeText,
        stage: body.stage || "applied",
        fitScore,
        fitSummary,
        matchedSkills: JSON.stringify(matchedSkills),
        missingSkills: JSON.stringify(missingSkills),
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json({
      application: {
        ...application,
        matchedSkills,
        missingSkills,
        scorecards: [],
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating candidate application:", err);
    return NextResponse.json(
      { error: "Failed to add candidate." },
      { status: 500 }
    );
  }
}
