import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildTeamInviteEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { getWorkspaceTypeLabel } from "@/shared/model/workspace.model";
import { getInviteTokenExpiresInHours } from "@/utils/helpers";

/**
 * Promoted to app-level (matches eventSphere). Team invite is platform
 * infrastructure (auth/onboarding flow) and shouldn't be workspace-customized.
 *
 * The legacy `businessId` arg is accepted for backwards compatibility with
 * existing callers but is no longer used to scope template resolution.
 */
export async function sendTeamInviteEmail(args: {
  request: NextRequest;
  businessId?: string;
  to: string;
  attendeeName?: string | null;
  workspaceName?: string | null;
  workspaceType?: string | null;
  rawToken: string;
  expiresHours?: number;
}) {
  void args.businessId;
  const baseUrl = resolveAppBaseUrl(args.request);
  const inviteUrl = `${baseUrl}/auth/onboard-user/${args.rawToken}`;
  const workspaceName = args.workspaceName ?? "Business";
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);
  const expiresHours =
    args.expiresHours && Number.isFinite(args.expiresHours)
      ? args.expiresHours
      : getInviteTokenExpiresInHours();

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.TEAM_INVITE,
    to: args.to,
    fallbackSubject: `You have been invited to join ${workspaceName}`,
    variables: {
      attendee_name: args.attendeeName ?? "",
      business_name: workspaceName,
      workspace_label: workspaceLabel,
      invite_url: inviteUrl,
      invite_expires_hours: expiresHours,
    },
    customBodyHtml: buildTeamInviteEmailHtml({
      attendeeName: args.attendeeName ?? "",
      workspaceName,
      workspaceLabel,
      inviteUrl,
      expiresHours: String(expiresHours),
    }),
  });
}
