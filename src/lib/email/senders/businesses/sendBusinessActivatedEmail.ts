import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildWorkspaceAccessStatusEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import {
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import { buildWorkspaceRecipientMap } from "@/lib/email/senders/workspaces/recipient-map";

export async function sendBusinessActivatedEmail(args: {
  request: NextRequest;
  businessName: string;
  workspaceType: WorkspaceType;
  businessEmail?: string;
  creatorName?: string;
  creatorEmail?: string;
}) {
  const recipients = buildWorkspaceRecipientMap({
    workspaceName: args.businessName,
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
  const loginUrl = `${baseUrl}/auth/login`;
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);

  const results = await Promise.all(
    [...recipients.entries()].map(([email, recipientName]) =>
      sendAppTemplateEmail({
        templateKey: APP_EMAIL_TEMPLATE.BUSINESS_ACTIVATED,
        to: email,
        fallbackSubject: `${args.businessName} is active again`,
        variables: {
          attendee_name: recipientName,
          business_name: args.businessName,
          workspace_label: workspaceLabel,
          login_url: loginUrl,
        },
        customBodyHtml: buildWorkspaceAccessStatusEmailHtml({
          attendeeName: recipientName,
          workspaceName: args.businessName,
          workspaceLabel,
          active: true,
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
