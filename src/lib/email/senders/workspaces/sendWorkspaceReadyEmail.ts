import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildWorkspaceReadyEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import {
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";

/**
 * Sent for the very first workspace created at signup time
 * (BUSINESS_REGISTRATION template).
 */
export async function sendWorkspaceReadyEmail(args: {
  request: NextRequest;
  recipientName: string;
  recipientEmail: string;
  businessName: string;
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
    templateKey: APP_EMAIL_TEMPLATE.BUSINESS_REGISTRATION,
    to: args.recipientEmail,
    fallbackSubject: `Welcome to Maintainly, ${args.businessName}`,
    variables: {
      attendee_name: args.recipientName,
      business_name: args.businessName,
      workspace_label: workspaceLabel,
      workspace_role: args.workspaceRole,
      dashboard_url: dashboardUrl,
      login_url: loginUrl,
    },
    customBodyHtml: buildWorkspaceReadyEmailHtml({
      attendeeName: args.recipientName,
      workspaceName: args.businessName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
      dashboardUrl,
      loginUrl,
    }),
  });
}
