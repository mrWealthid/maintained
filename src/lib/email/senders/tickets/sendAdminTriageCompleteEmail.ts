import type { NextRequest } from "next/server";

import { sendBusinessTemplateEmail } from "@/lib/email/clients/business-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import User from "@/models/userModel";
import { BUSINESS_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";

type AdminRecipient = { name: string; email: string };

async function findBusinessAdminRecipients(
  businessId: string,
): Promise<AdminRecipient[]> {
  const users = await User.find({
    memberships: {
      $elemMatch: {
        business: businessId,
        role: { $in: [ROLES.admin, ROLES.owner, ROLES.super_admin] },
        status: INVITE_STATUS.activated,
      },
    },
  })
    .select("name email")
    .lean<Array<{ name?: string; email?: string }>>();

  return users
    .filter((u): u is { name?: string; email: string } => Boolean(u.email))
    .map((u) => ({ name: u.name?.trim() || "Team", email: u.email }));
}

export async function sendAdminTriageCompleteEmail(args: {
  request: NextRequest;
  businessId: string;
  ticketSlug: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketCategory?: string;
  recommendedTicketType?: string;
  propertyName?: string;
  unitLabel?: string;
  needsHumanReview?: boolean;
  adminNotes?: string;
}) {
  const recipients = await findBusinessAdminRecipients(args.businessId);
  if (recipients.length === 0) {
    return { sent: false, skippedReason: "No active workspace admins found" };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const ticketUrl = `${baseUrl}/dashboard/ticket-management/${args.ticketSlug}`;

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendBusinessTemplateEmail({
        businessId: args.businessId,
        templateKey: BUSINESS_EMAIL_TEMPLATE.TICKET_AI_TRIAGE_COMPLETE,
        to: recipient.email,
        fallbackSubject: `[${args.ticketPriority}] AI triage complete: ${args.ticketTitle}`,
        variables: {
          attendee_name: recipient.name,
          ticket_title: args.ticketTitle,
          ticket_priority: args.ticketPriority,
          ticket_category: args.ticketCategory ?? "Uncategorised",
          recommended_ticket_type: args.recommendedTicketType ?? "—",
          property_name: args.propertyName ?? "",
          unit_label: args.unitLabel ?? "",
          needs_human_review: args.needsHumanReview ? "Yes" : "No",
          admin_notes: args.adminNotes?.trim() || "No additional notes.",
          ticket_url: ticketUrl,
        },
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
