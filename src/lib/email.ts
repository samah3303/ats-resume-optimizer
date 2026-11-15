import { Resend } from "resend";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  expiresAt?: Date;
}

const DEFAULT_EMAIL_FROM =
  process.env.EMAIL_FROM?.trim() || "paniund <noreply@yourdomain.com>";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Core sendEmail utility using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_EMAIL_FROM,
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    console.warn(
      `[Email] RESEND_API_KEY is not set. Skipped dispatching email to ${JSON.stringify(to)} with subject "${subject}".`
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    const response = await resend.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    if (response.error) {
      console.error("[Email] Resend API response error:", response.error);
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      id: response.data?.id,
    };
  } catch (err) {
    console.error("[Email] Exception sending email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

/**
 * Sends a password reset email using the paniund Nordic design system.
 * Features a deep navy header, warm yellow accents, clean card layout,
 * a 1-hour expiry notice, and fallback URL.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresAt,
}: SendPasswordResetEmailParams) {
  const subject = "Reset your paniund password";

  const expiryFormatted = expiresAt
    ? expiresAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "in 1 hour";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F5F5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #DFDFDF; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 12px rgba(17, 17, 17, 0.06);">
          
          <!-- Nordic Deep Navy Header (#003399) -->
          <tr>
            <td style="background-color: #003399; padding: 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 28px; height: 28px; background-color: #FFDA1A; color: #003399; font-weight: 900; font-size: 14px; text-align: center; border-radius: 4px; vertical-align: middle;">
                          P.
                        </td>
                        <td style="padding-left: 10px; color: #FFFFFF;">
                          <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.02em; display: block; line-height: 1.1;">paniund</span>
                          <span style="font-size: 10px; color: rgba(255, 255, 255, 0.8); text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">ATS Resume & Job Workspace</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 14px; font-size: 20px; font-weight: 700; color: #111111; letter-spacing: -0.01em;">
                Reset your password
              </h1>
              
              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #484848;">
                We received a request to reset the password for your paniund account (<strong>${to}</strong>). Click the button below to create a new password.
              </p>

              <!-- CTA Button -->
              <div style="margin: 28px 0; text-align: center;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="10%" strokecolor="#003399" fillcolor="#003399">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:bold;">RESET PASSWORD &rarr;</center>
                </v:roundrect>
                <![endif]-->
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #003399; color: #FFFFFF; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 13px 28px; text-decoration: none; border-radius: 4px; display: inline-block; mso-hide: all;">
                  Reset Password &rarr;
                </a>
              </div>

              <!-- 1-Hour Expiry Notice -->
              <div style="background-color: #FFF9E6; border-left: 4px solid #FFDA1A; padding: 12px 14px; margin: 24px 0 18px; border-radius: 2px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #735100;">
                  ⏱️ <strong>1-Hour Expiry Notice:</strong> This reset link remains valid for <strong>1 hour</strong> (until approx. ${expiryFormatted}). If you did not request a password reset, you can safely ignore this message—your account remains protected.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 22px 0 0; font-size: 11px; line-height: 1.5; color: #767676; border-top: 1px solid #DFDFDF; padding-top: 16px;">
                Button not working? Copy and paste this URL into your web browser:<br />
                <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="color: #003399; word-break: break-all; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #DFDFDF; padding: 18px 32px; font-size: 11px; color: #767676; text-align: center; line-height: 1.5;">
              <p style="margin: 0 0 4px;"><strong>paniund</strong> &bull; Smart Job Search & ATS Resume Optimization</p>
              <p style="margin: 0;">Sent to ${to} &bull; Do not reply directly to this automated email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Reset your paniund password

We received a request to reset the password for your paniund account (${to}).

To reset your password, visit the link below:
${resetUrl}

1-HOUR EXPIRY NOTICE: This link is valid for 1 hour only. If you did not request this password reset, please ignore this email.

---
paniund — ATS Resume & Job Search Workspace
`;

  return sendEmail({
    to,
    subject,
    html,
    text,
    from: DEFAULT_EMAIL_FROM,
  });
}
