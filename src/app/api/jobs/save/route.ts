import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, company, description, url, source } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const jobDescription = await prisma.jobDescription.create({
      data: {
        userId: session.user.id,
        title,
        company,
        rawText: description,
        sourceUrl: url,
        notes: source ? `Saved from ${source}` : null,
      },
    });

    return NextResponse.json(jobDescription, { status: 201 });
  } catch (error: any) {
    console.error('Error in /api/jobs/save:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
