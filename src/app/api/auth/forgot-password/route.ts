import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return apiError("Invalid request body", 400);
    }

    const { email } = forgotPasswordSchema.parse(rawBody);

    // Look up user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    let devResetUrl: string | null = null;

    if (user) {
      // 1. Invalidate any existing active tokens for this email
      await prisma.passwordResetToken.deleteMany({
        where: { email },
      });

      // 2. Generate cryptographically secure 64-character token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      // 3. Store token in database
      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      // 4. Construct reset URL
      const origin =
        request.headers.get("origin") ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const resetUrl = `${origin}/reset-password?token=${token}`;

      console.log(`\n======================================================`);
      console.log(`[PASSWORD RESET DISPATCHED]`);
      console.log(`Account: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Expires: ${expiresAt.toISOString()}`);
      console.log(`======================================================\n`);

      // In development mode, surface the URL for seamless developer/testing flow
      if (process.env.NODE_ENV !== "production") {
        devResetUrl = resetUrl;
      }

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: "password_reset_requested",
          details: `Password reset token generated for ${email}`,
        },
      });
    }

    // Always return success to protect against email enumeration / reconnaissance
    return apiSuccess({
      message:
        "If an account exists for this email address, password reset instructions have been sent.",
      devResetUrl,
    });
  } catch (error) {
    return handleApiError(error, "Failed to process password reset request");
  }
}
