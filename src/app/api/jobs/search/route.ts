import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { jobAggregator } from '@/lib/job-sources';
import { scoreJobsAgainstResume } from '@/lib/ai/job-matcher';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Perform search
    const searchResults = await jobAggregator.search(body);

    // If user has primary resume, score the jobs
    const primaryResume = await prisma.resume.findFirst({
      where: { userId: session.user.id, isPrimary: true },
      select: { parsedText: true },
    });

    if (primaryResume?.parsedText && searchResults.jobs?.length > 0) {
      const jobsForScoring = searchResults.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
      }));

      const scoresMap = await scoreJobsAgainstResume(primaryResume.parsedText, jobsForScoring);

      searchResults.jobs = searchResults.jobs.map((job: any) => ({
        ...job,
        matchScore: scoresMap.get(job.id) || 0,
      }));

      // Sort by match score descending
      searchResults.jobs.sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return NextResponse.json(searchResults);
  } catch (error: any) {
    console.error('Error in /api/jobs/search:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
