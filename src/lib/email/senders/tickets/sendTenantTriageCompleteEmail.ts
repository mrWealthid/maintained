import type { NextRequest } from "next/server";

import { sendBusinessTemplateEmail } from "@/lib/email/clients/business-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import User from "@/models/userModel";
import { BUSINESS_EMAIL_TEMPLATE } from "@/shared/enums/email-template";

type TenantRecipient = { name: string; email: string };

async function findTicketTenant(userId: string): Promise<TenantRecipient | null> {
  const user = await User.findById(userId)
    .select("name email")
    .lean<{ name?: string; email?: string } | null>();
  if (!user?.email) return null;
  return { name: user.name?.trim() || "there", email: user.email };
}

function buildSafetyBlock(safetyInstructions?: string[]): string {
  if (!safetyInstructions?.length) return "";
  const bullets = safetyInstructions
    .map((step) => `- ${step}`)
    .join("\n");
  return `Important safety steps to take now:\n${bullets}`;
}

export async function sendTenantTriageCompleteEmail(args: {
  request: NextRequest;
  businessId: string;
  tenantUserId: string;
  ticketId: string;
  ticketTitle: string;
  ticketPriority: string;
  propertyName?: string;
  unitLabel?: string;
  userReply?: string;
  safetyInstructions?: string[];
}) {
  if (!args.userReply?.trim()) {
    return { sent: false, skippedReason: "AI produced no userReply" };
  }

  const tenant = await findTicketTenant(args.tenantUserId);
  if (!tenant) {
    return { sent: false, skippedReason: "Tenant user not found or has no email" };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const ticketUrl = `${baseUrl}/tickets/${args.ticketId}`;

  return sendBusinessTemplateEmail({
    businessId: args.businessId,
    templateKey: BUSINESS_EMAIL_TEMPLATE.TICKET_AI_TRIAGE_TENANT_UPDATE,
    to: tenant.email,
    fallbackSubject: `Update on your maintenance request: ${args.ticketTitle}`,
    variables: {
      attendee_name: tenant.name,
      ticket_title: args.ticketTitle,
      ticket_priority: args.ticketPriority,
      property_name: args.propertyName ?? "",
      unit_label: args.unitLabel ?? "",
      user_reply: args.userReply.trim(),
      safety_instructions_block: buildSafetyBlock(args.safetyInstructions),
      ticket_url: ticketUrl,
    },
  });
}
