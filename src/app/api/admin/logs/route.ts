import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const limit = Math.min(parseInt(searchParams.get("limit") || "40", 10), 100);

    const logs = await prisma.activityLog.findMany({
      where: action ? { action } : undefined,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      total: logs.length,
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        details: l.details,
        createdAt: l.createdAt,
        user: {
          id: l.user.id,
          name: l.user.name || "Candidate",
          email: l.user.email,
        },
      })),
    });
  } catch (error) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ error: "Failed to load activity logs" }, { status: 500 });
  }
}
