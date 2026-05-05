import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildAdditionalWorkspaceCreatedEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import {
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";

/**
 * Sent when an existing account creates an additional workspace.
 */
export async function sendWorkspaceCreatedEmail(args: {
  request: NextRequest;
  recipientName: string;
  recipientEmail: string;
  workspaceName: string;
  workspaceType: WorkspaceType;
  workspaceRole: string;
}) {
  if (!args.recipientEmail?.trim()) {
    return { sent: false, skippedReason: "No recipient email provided" };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const dashboardUrl = `${baseUrl}/dashboard`;
  const loginUrl = `${baseUrl}/auth/login`;
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);

  return sendAppTemplateEmail({
    templateKey: APP_EMAIL_TEMPLATE.WORKSPACE_CREATED,
    to: args.recipientEmail,
    fallbackSubject: `${args.workspaceName} workspace created`,
    variables: {
      attendee_name: args.recipientName,
      business_name: args.workspaceName,
      workspace_label: workspaceLabel,
      workspace_role: args.workspaceRole,
      dashboard_url: dashboardUrl,
      login_url: loginUrl,
    },
    customBodyHtml: buildAdditionalWorkspaceCreatedEmailHtml({
      attendeeName: args.recipientName,
      workspaceName: args.workspaceName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
      dashboardUrl,
      loginUrl,
    }),
  });
}
