import type { NextRequest } from "next/server";

import { sendAppTemplateEmail } from "@/lib/email/clients/app-email.client";
import { buildWorkspaceAccessStatusEmailHtml } from "@/lib/email/helpers/app-email-layout";
import { APP_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import {
  getWorkspaceTypeLabel,
  type WorkspaceType,
} from "@/shared/model/workspace.model";
import { buildWorkspaceRecipientMap } from "@/lib/email/senders/workspaces/recipient-map";

export async function sendBusinessDeactivatedEmail(args: {
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

  void args.request;
  const workspaceLabel = getWorkspaceTypeLabel(args.workspaceType);
  const results = await Promise.all(
    [...recipients.entries()].map(([email, recipientName]) =>
      sendAppTemplateEmail({
        templateKey: APP_EMAIL_TEMPLATE.BUSINESS_DEACTIVATED,
        to: email,
        fallbackSubject: `${args.businessName} has been deactivated`,
        variables: {
          attendee_name: recipientName,
          business_name: args.businessName,
          workspace_label: workspaceLabel,
        },
        customBodyHtml: buildWorkspaceAccessStatusEmailHtml({
          attendeeName: recipientName,
          workspaceName: args.businessName,
          workspaceLabel,
          active: false,
        }),
      }),
    ),
  );

  const firstFailure = results.find(
    (r) => !r.sent && !r.skippedReason,
  );
  if (firstFailure) return firstFailure;

  return {
    sent: results.some((r) => r.sent),
    skippedReason:
      results.every((r) => !r.sent) && results[0]?.skippedReason
        ? results[0].skippedReason
        : undefined,
  };
}
