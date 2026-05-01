import type { NextRequest } from "next/server";
import { BUSINESS_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { sendBusinessTemplateEmail } from "@/lib/email/clients/business-email.client";
import { buildTeamInviteEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";

export async function sendTeamInviteEmail(args: {
  request: NextRequest;
  businessId: string;
  to: string;
  attendeeName: string;
  workspaceName: string;
  rawToken: string;
}) {
  const inviteUrl = `${resolveAppBaseUrl(args.request)}/auth/onboard-user/${args.rawToken}`;
  const expiresHours = process.env.INVITE_TOKEN_EXPIRES_IN_HOURS || "48";

  return sendBusinessTemplateEmail({
    businessId: args.businessId,
    templateKey: BUSINESS_EMAIL_TEMPLATE.TEAM_INVITE,
    to: args.to,
    fallbackSubject: `You have been invited to join ${args.workspaceName}`,
    variables: {
      attendee_name: args.attendeeName,
      business_name: args.workspaceName,
      invite_url: inviteUrl,
      invite_expires_hours: expiresHours,
    },
    customBodyHtml: buildTeamInviteEmailHtml({
      attendeeName: args.attendeeName,
      workspaceName: args.workspaceName,
      inviteUrl,
      expiresHours,
    }),
  });
}
