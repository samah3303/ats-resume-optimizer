import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Check Bearer Token in Authorization header
    const authHeader = request.headers.get("authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const user = await prisma.user.findUnique({
        where: { apiToken: token },
        select: { id: true, email: true, name: true },
      });
      if (user) {
        userId = user.id;
        userEmail = user.email;
        userName = user.name;
      }
    }

    // 2. Check Session cookie fallback
    if (!userId) {
      const session = await getServerSession(authOptions);
      if (session?.user && (session.user as { id: string }).id) {
        userId = (session.user as { id: string }).id;
        userEmail = session.user.email || null;
        userName = session.user.name || null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated with paniund.",
        },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // Get count of tracked jobs
    const jobCount = await prisma.job.count({
      where: { userId },
    });

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userId,
          email: userEmail,
          name: userName,
        },
        jobCount,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Extension status error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
