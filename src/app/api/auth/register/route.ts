import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, setupPasswordSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return apiError("Invalid JSON body", 400);
    }

    // Case 1: Password setup for a new candidate who uploaded a resume on the landing page
    if (rawBody.userId) {
      const { userId, password } = setupPasswordSchema.parse(rawBody);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return apiError("Candidate record not found. Please upload your resume again.", 404);
      }

      if (user.passwordHash) {
        return apiError("Password has already been set for this account. Please sign in.", 409);
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
        select: { id: true, email: true, name: true },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "password_configured",
          details: "Candidate configured password after initial resume upload",
        },
      });

      return apiSuccess({ user: updatedUser }, 200);
    }

    // Case 2: Standard registration via /register
    const { email, password, name } = registerSchema.parse(rawBody);

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    // Bcrypt with factor 12 for strong brute-force resistance
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: { id: true, email: true },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "account_created",
        details: "Account registered via email/password",
      },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    return handleApiError(error, "Failed to create account");
  }
}
