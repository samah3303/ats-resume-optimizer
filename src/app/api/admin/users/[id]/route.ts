import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { adminUserUpdateSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin) {
    return apiError("Unauthorized. Admin privileges required.", 403);
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { role } = adminUserUpdateSchema.parse(body);

    // Prevent admin self-lockout: Admin cannot demote their own account to "user"
    if (admin.user.id === id && role && role !== "admin") {
      return apiError("Security policy: You cannot demote your own admin account.", 400);
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

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, "Failed to update user");
  }
}
