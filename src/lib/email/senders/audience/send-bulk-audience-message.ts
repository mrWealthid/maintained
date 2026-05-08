import {
  sendBusinessTransactionalEmail,
} from "@/lib/email/clients/business-email.client";
import {
  asHtmlWithLinks,
  escapeHtml,
} from "@/lib/email/helpers/email-html";
import {
  buildGenericEmailBadge,
  buildGenericEmailLead,
  buildGenericInfoPanel,
} from "@/lib/email/helpers/generic-email-layout";
import type {
  AudienceMessageComposeMode,
  AudienceMessageSendResult,
} from "@/shared/model/audience-message.model";

type AudienceMessageRecipient = {
  id: string;
  name: string;
  email: string;
};

type SendBulkAudienceMessageArgs = {
  businessId: string;
  audienceLabel: string;
  composeMode: AudienceMessageComposeMode;
  subject: string;
  message: string;
  recipients: AudienceMessageRecipient[];
};

function buildMessageHtml(args: {
  audienceLabel: string;
  composeMode: AudienceMessageComposeMode;
  recipientName: string;
  message: string;
}) {
  const body =
    args.composeMode === "plain"
      ? `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(
          args.message,
        ).replace(/\n/g, "<br />")}</p>`
      : asHtmlWithLinks(args.message);

  return `
    ${buildGenericEmailBadge({
      label: "Workspace message",
      tone: "info",
      secondaryLabel: args.audienceLabel,
    })}
    ${buildGenericEmailLead({
      attendeeName: args.recipientName,
      intro: "Your property management team sent you a new message.",
    })}
    ${buildGenericInfoPanel({
      title: "Message",
      description: "Please review the note below.",
      tone: "info",
    })}
    <div style="margin-top:4px;">
      ${body}
    </div>
  `;
}

export async function sendBulkAudienceMessage(
  args: SendBulkAudienceMessageArgs,
): Promise<AudienceMessageSendResult> {
  const uniqueRecipients = Array.from(
    new Map(
      args.recipients
        .filter((recipient) => recipient.email)
        .map((recipient) => [recipient.email.toLowerCase(), recipient]),
    ).values(),
  );

  const deliveries = await Promise.all(
    uniqueRecipients.map((recipient) =>
      sendBusinessTransactionalEmail({
        businessId: args.businessId,
        to: recipient.email,
        subject: args.subject,
        html: buildMessageHtml({
          audienceLabel: args.audienceLabel,
          composeMode: args.composeMode,
          recipientName: recipient.name || "there",
          message: args.message,
        }),
      }),
    ),
  );

  const successCount = deliveries.filter((delivery) => delivery.sent).length;

  return {
    requestedCount: args.recipients.length,
    recipientCount: uniqueRecipients.length,
    successCount,
    failureCount: uniqueRecipients.length - successCount,
  };
}
