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
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: { organization: true },
    });

    const hasJobs = await prisma.jobPosting.count({
      where: { userId },
    });

    // Completed if recruiter profile exists or has posted jobs
    const completed = !!profile || hasJobs > 0;

    return NextResponse.json({
      completed,
      profile,
    });
  } catch (error) {
    console.error("Recruiter onboarding GET error:", error);
    return NextResponse.json({ error: "Failed to fetch recruiter status" }, { status: 500 });
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
    const {
      companyName,
      recruiterRole,
      hiringDomain,
      headcountTarget,
      jobTitle,
      department,
      location,
      jobType,
      remotePolicy,
      description,
      requirements,
      pipelinePreset,
    } = body;

    // 1. Create or update Organization
    let org = await prisma.organization.findFirst({
      where: { name: companyName || "My Organization" },
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: companyName || "My Organization",
          industry: hiringDomain || "Technology",
          size: headcountTarget || "1-10",
        },
      });
    }

    // 2. Upsert Recruiter Profile
    const profile = await prisma.recruiterProfile.upsert({
      where: { userId },
      update: {
        companyName: companyName || "My Organization",
        role: recruiterRole || "Lead Technical Recruiter",
        organizationId: org.id,
      },
      create: {
        userId,
        companyName: companyName || "My Organization",
        role: recruiterRole || "Lead Technical Recruiter",
        organizationId: org.id,
      },
    });

    // 3. If jobTitle provided, create the initial Job Requisition
    let createdJob = null;
    if (jobTitle && jobTitle.trim()) {
      createdJob = await prisma.jobPosting.create({
        data: {
          userId,
          organizationId: org.id,
          title: jobTitle.trim(),
          department: department || hiringDomain || "Engineering",
          location: location || "Remote",
          jobType: jobType || "full-time",
          remotePolicy: remotePolicy || "remote",
          salaryMin: 120000,
          salaryMax: 175000,
          currency: "USD",
          description: description || `We are looking for an exceptional ${jobTitle} to join our growing team.`,
          requirements: requirements || `Demonstrated track record of technical ownership, problem-solving, and domain leadership.`,
          status: "active",
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      organization: org,
      job: createdJob,
      pipelinePreset,
    });
  } catch (error) {
    console.error("Recruiter onboarding POST error:", error);
    return NextResponse.json({ error: "Failed to complete recruiter setup" }, { status: 500 });
  }
}
