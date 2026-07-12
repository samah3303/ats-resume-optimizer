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

  const profile = await prisma.onboardingProfile.findUnique({
    where: { userId },
  });

  return NextResponse.json({
    completed: !!profile,
    profile,
    // Convenience flat fields for the analyze page
    targetPositions: profile?.targetPositions ?? null,
    country: profile?.targetCountry ?? null,
    jobType: profile?.jobType ?? null,
    industry: profile?.industry ?? null,
  });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    await prisma.roadmap.deleteMany({
      where: { userId },
    });

    await prisma.onboardingProfile.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to reset onboarding data." },
      { status: 500 }
    );
  }
}
