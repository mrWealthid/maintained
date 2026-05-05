import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildWorkspaceUpgradedEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import {
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import { buildWorkspaceRecipientMap } from "@/lib/email/senders/workspaces/recipient-map";

export async function sendWorkspaceUpgradedEmail(args: {
  request: NextRequest;
  workspaceName: string;
  previousWorkspaceType: WorkspaceType;
  workspaceType: WorkspaceType;
  businessEmail?: string;
  creatorName?: string;
  creatorEmail?: string;
}) {
  const recipients = buildWorkspaceRecipientMap({
    workspaceName: args.workspaceName,
    workspaceEmail: args.businessEmail,
    creatorName: args.creatorName,
    creatorEmail: args.creatorEmail,
  });
  if (recipients.size === 0) {
    return {
      sent: false,
      skippedReason: "No business creator or business email available",
    };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const dashboardUrl = `${baseUrl}/dashboard`;
  const loginUrl = `${baseUrl}/auth/login`;
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);
  const previousWorkspaceLabel = getWorkspaceTypeLabel(args.previousWorkspaceType);

  const results = await Promise.all(
    [...recipients.entries()].map(([email, recipientName]) =>
      sendAppTemplateEmail({
        templateKey: APP_EMAIL_TEMPLATE.WORKSPACE_UPGRADED,
        to: email,
        fallbackSubject: `${args.workspaceName} has been upgraded`,
        variables: {
          attendee_name: recipientName,
          business_name: args.workspaceName,
          workspace_label: workspaceLabel,
          previous_workspace_label: previousWorkspaceLabel,
          dashboard_url: dashboardUrl,
          login_url: loginUrl,
        },
        customBodyHtml: buildWorkspaceUpgradedEmailHtml({
          attendeeName: recipientName,
          workspaceName: args.workspaceName,
          workspaceLabel,
          previousWorkspaceLabel,
          dashboardUrl,
          loginUrl,
        }),
      }),
    ),
  );

  const firstFailure = results.find((r) => !r.sent && !r.skippedReason);
  if (firstFailure) return firstFailure;

  return {
    sent: results.some((r) => r.sent),
    skippedReason:
      results.every((r) => !r.sent) && results[0]?.skippedReason
        ? results[0].skippedReason
        : undefined,
  };
}
