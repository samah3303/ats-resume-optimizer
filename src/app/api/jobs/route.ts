import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const bookmarked = searchParams.get("bookmarked");

    const where: { userId: string; isBookmarked?: boolean } = { userId };
    if (bookmarked === "true") {
      where.isBookmarked = true;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { id: true, status: true, appliedAt: true },
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Jobs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const {
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
    } = body as {
      title: string;
      company?: string;
      location?: string;
      salary?: string;
      jobType?: string;
      description?: string;
      requirements?: string;
      sourceUrl?: string;
      source?: string;
      matchScore?: number;
    };

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Job title is required" },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: {
        userId,
        title: title.trim(),
        company: company?.trim() || null,
        location: location?.trim() || null,
        salary: salary?.trim() || null,
        jobType: jobType || null,
        description: description || null,
        requirements: requirements || null,
        sourceUrl: sourceUrl?.trim() || null,
        source: source || "manual",
        matchScore: typeof matchScore === "number" ? matchScore : null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "job_added",
        details: `Added job: ${title} at ${company || "Unknown"}`,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}
