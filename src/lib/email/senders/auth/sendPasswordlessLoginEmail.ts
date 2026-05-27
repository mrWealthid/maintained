import type { NextRequest } from "next/server";

import {
  getSafePasswordlessNextPath,
  PASSWORDLESS_LOGIN_QUERY_PARAM,
} from "@/lib/auth/passwordless";
import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildSecureActionEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { API_ROUTES } from "@/shared/routes/apiRoutes";

const PASSWORDLESS_LINK_EXPIRES_MINUTES = 10;

export async function sendPasswordlessLoginEmail(args: {
  request: NextRequest;
  to: string;
  attendeeName: string;
  loginToken: string;
  next?: string;
  supportEmail?: string;
}) {
  const baseUrl = resolveAppBaseUrl(args.request);
  const verifyUrl = new URL(`${baseUrl}${API_ROUTES.auth.passwordlessVerify}`);
  verifyUrl.searchParams.set(
    PASSWORDLESS_LOGIN_QUERY_PARAM.TOKEN,
    args.loginToken,
  );
  verifyUrl.searchParams.set(
    PASSWORDLESS_LOGIN_QUERY_PARAM.NEXT,
    getSafePasswordlessNextPath(args.next),
  );

  const revokeUrl = new URL(`${baseUrl}${API_ROUTES.auth.passwordlessRevoke}`);
  revokeUrl.searchParams.set(
    PASSWORDLESS_LOGIN_QUERY_PARAM.TOKEN,
    args.loginToken,
  );

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.PASSWORDLESS_LOGIN,
    to: args.to,
    fallbackSubject: "Your secure sign-in link",
    variables: {
      attendee_name: args.attendeeName,
      magic_link_url: verifyUrl.toString(),
      magic_link_revoke_url: revokeUrl.toString(),
      magic_link_expires_minutes: PASSWORDLESS_LINK_EXPIRES_MINUTES,
      support_email: args.supportEmail,
    },
    replyTo: args.supportEmail,
    customBodyHtml: buildSecureActionEmailHtml({
      badgeLabel: "Secure Sign-In",
      attendeeName: args.attendeeName,
      intro: "You requested a passwordless sign-in link for Properly.",
      actionTitle: "Sign in without a password",
      actionDescription:
        "Use the secure link below to sign in. The link expires shortly and can only be used once.",
      actionLabel: "Sign in",
      actionUrl: verifyUrl.toString(),
      expiryLabel: `${PASSWORDLESS_LINK_EXPIRES_MINUTES} minutes`,
      tone: "info",
      safetyTitle: "Did not request this?",
      safetyDescription: `If you did not request this link you can revoke it here: ${revokeUrl.toString()}`,
    }),
  });
}
