import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { role } = body;

    if (role && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid role. Must be 'admin' or 'user'." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
