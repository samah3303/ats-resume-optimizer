import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return apiError("Invalid request body", 400);
    }

    const { token, password } = resetPasswordSchema.parse(rawBody);

    // 1. Look up reset token record
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return apiError(
        "Invalid or expired password reset link. Please request a new one.",
        400
      );
    }

    // 2. Check if token has expired
    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return apiError(
        "This password reset link has expired. Please request a new link.",
        400
      );
    }

    // 3. Find the user associated with this token
    const user = await prisma.user.findUnique({
      where: { email: resetRecord.email },
    });

    if (!user) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return apiError("User associated with this token was not found.", 404);
    }

    // 4. Hash new password with 12 rounds of bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Update user password and remove used token in transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { email: resetRecord.email },
      }),
      prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "password_reset_completed",
          details: `Password was successfully reset using secure token`,
        },
      }),
    ]);

    return apiSuccess({
      message: "Your password has been successfully reset. You may now sign in.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to reset password");
  }
}
