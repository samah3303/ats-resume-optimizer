import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apiToken: true },
    });

    // Auto-generate token if user doesn't have one yet
    if (!user?.apiToken) {
      const newToken = `pnd_${crypto.randomBytes(24).toString("hex")}`;
      user = await prisma.user.update({
        where: { id: userId },
        data: { apiToken: newToken },
        select: { apiToken: true },
      });
    }

    return NextResponse.json({ apiToken: user?.apiToken });
  } catch (error) {
    console.error("API token fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const newToken = `pnd_${crypto.randomBytes(24).toString("hex")}`;

    await prisma.user.update({
      where: { id: userId },
      data: { apiToken: newToken },
    });

    return NextResponse.json({
      apiToken: newToken,
      message: "New API token generated successfully.",
    });
  } catch (error) {
    console.error("API token generation error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
