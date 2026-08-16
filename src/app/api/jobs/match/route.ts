import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobAggregator } from '@/lib/job-sources';
import { generateSearchQueries, scoreJobsAgainstResume } from '@/lib/ai/job-matcher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { resumeId } = body;

    let resume;
    if (resumeId) {
      resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
      });
    } else {
      resume = await prisma.resume.findFirst({
        where: { userId: session.user.id, isPrimary: true },
      });
    }

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // 1. Generate search queries based on resume text
    const queries = await generateSearchQueries(resume.parsedText);

    if (!queries || queries.length === 0) {
      return NextResponse.json({ error: 'Failed to generate search queries' }, { status: 500 });
    }

    // 2. Search jobs across multiple queries
    const topQueries = queries.slice(0, 3);
    const allJobsMap = new Map();

    for (const query of topQueries) {
      const results = await jobAggregator.search({ query, limit: 10 });
      if (results?.jobs) {
        for (const job of results.jobs) {
          if (!allJobsMap.has(job.id)) {
            allJobsMap.set(job.id, job);
          }
        }
      }
    }

    const aggregatedJobs = Array.from(allJobsMap.values());

    if (aggregatedJobs.length === 0) {
      return NextResponse.json({ jobs: [] });
    }

    // 3. Score results
    const jobsForScoring = aggregatedJobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
    }));

    const scoresMap = await scoreJobsAgainstResume(resume.parsedText, jobsForScoring);

    const scoredJobs = aggregatedJobs.map((job: any) => ({
      ...job,
      matchScore: scoresMap.get(job.id) || 0,
    }));

    // 4. Sort and return
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ jobs: scoredJobs });
  } catch (error: any) {
    console.error('Error in /api/jobs/match:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
