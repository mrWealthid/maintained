import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildPasswordUpdatedEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";

export async function sendPasswordUpdatedEmail(args: {
  request: NextRequest;
  to: string;
  attendeeName: string;
}) {
  const baseUrl = resolveAppBaseUrl(args.request);
  const loginUrl = `${baseUrl}${APP_ROUTE_PATHS.AUTH.LOGIN}`;

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.PASSWORD_UPDATED,
    to: args.to,
    fallbackSubject: "Your Properly password was updated",
    variables: {
      attendee_name: args.attendeeName,
      login_url: loginUrl,
    },
    customBodyHtml: buildPasswordUpdatedEmailHtml({
      attendeeName: args.attendeeName,
      loginUrl,
    }),
  });
}
