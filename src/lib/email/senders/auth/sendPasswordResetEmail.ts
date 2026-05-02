import type { NextRequest } from "next/server";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildSecureActionEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";

export async function sendPasswordResetEmail(args: {
  request: NextRequest;
  to: string;
  attendeeName: string;
  resetToken: string;
}) {
  const resetUrl = `${resolveAppBaseUrl(args.request)}/auth/updatePassword/${args.resetToken}`;
  const expiresMinutes = process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || "10";

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.FORGOT_PASSWORD,
    to: args.to,
    fallbackSubject: "Reset your Maintainly password",
    variables: {
      attendee_name: args.attendeeName,
      reset_url: resetUrl,
      reset_token_expires_minutes: expiresMinutes,
    },
    customBodyHtml: buildSecureActionEmailHtml({
      badgeLabel: "Password Reset",
      attendeeName: args.attendeeName,
      intro: "We received a request to reset your Maintainly password.",
      actionTitle: "Choose a new password",
      actionDescription:
        "Use the secure link below to set a new password for your account.",
      actionLabel: "Reset Password",
      actionUrl: resetUrl,
      expiryLabel: `${expiresMinutes} minutes`,
      tone: "warning",
      safetyTitle: "Did not request this?",
      safetyDescription:
        "You can ignore this email if you did not request a password reset.",
    }),
  });
}
