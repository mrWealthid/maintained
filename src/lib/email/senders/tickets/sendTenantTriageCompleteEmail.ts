import type { NextRequest } from "next/server";

import { sendBusinessTemplateEmail } from "@/lib/email/clients/business-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { asHtmlWithLinks, escapeHtml } from "@/lib/email/helpers/email-html";
import {
  buildGenericDetailsGrid,
  buildGenericEmailBadge,
  buildGenericEmailBanner,
  buildGenericEmailLead,
  buildGenericInfoPanel,
  buildGenericKeyValueTable,
} from "@/lib/email/helpers/generic-email-layout";
import User from "@/models/userModel";
import { BUSINESS_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { TICKET_PRIORITY } from "@/shared/enums/enums";

type TenantRecipient = { name: string; email: string };
type TriageEmailTone = "success" | "info" | "warning" | "danger" | "neutral";

async function findTicketTenant(userId: string): Promise<TenantRecipient | null> {
  const user = await User.findById(userId)
    .select("name email")
    .lean<{ name?: string; email?: string } | null>();
  if (!user?.email) return null;
  return { name: user.name?.trim() || "there", email: user.email };
}

function formatPriority(priority: string) {
  return priority
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function priorityTone(priority: string): TriageEmailTone {
  if (priority === TICKET_PRIORITY.emergency) return "danger";
  if (priority === TICKET_PRIORITY.high) return "warning";
  return "info";
}

function locationLabel(propertyName?: string, unitLabel?: string) {
  return [propertyName, unitLabel].filter((value) => value?.trim()).join(" · ");
}

function buildTextListBlock(title: string, items?: string[]): string {
  if (!items?.length) return "";
  const bullets = items
    .map((step) => `- ${step}`)
    .join("\n");
  return `${title}:\n${bullets}`;
}

function buildBulletPanel(args: {
  title: string;
  items?: string[];
  tone?: TriageEmailTone;
}) {
  const items = args.items?.filter((item) => item.trim()) ?? [];
  if (!items.length) return "";

  const toneStyles: Record<TriageEmailTone, { bg: string; border: string; text: string }> = {
    success: { bg: "rgba(16, 185, 129, 0.08)", border: "#10b981", text: "#047857" },
    info: { bg: "rgba(217, 119, 6, 0.05)", border: "rgba(217, 119, 6, 0.25)", text: "#92400e" },
    warning: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
    danger: { bg: "rgba(239, 68, 68, 0.08)", border: "#fca5a5", text: "#991b1b" },
    neutral: { bg: "#f8fafc", border: "#e5e7eb", text: "#475569" },
  };
  const tone = toneStyles[args.tone ?? "neutral"];
  const itemsHtml = items
    .map(
      (item) => `
        <li style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${tone.text};">
          ${escapeHtml(item)}
        </li>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${tone.bg};border:1px solid ${tone.border};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1a1a2e;">
            ${escapeHtml(args.title)}
          </p>
          <ul style="margin:0;padding-left:18px;">
            ${itemsHtml}
          </ul>
        </td>
      </tr>
    </table>
  `;
}

function buildAssessmentPanel(userReply: string) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1a1a2e;">
            Assessment summary
          </p>
          <div style="font-size:13px;line-height:1.6;color:#334155;">
            ${asHtmlWithLinks(userReply)}
          </div>
        </td>
      </tr>
    </table>
  `;
}

function buildTenantTriageEmailHtml(args: {
  attendeeName: string;
  ticketTitle: string;
  ticketPriority: string;
  propertyName?: string;
  unitLabel?: string;
  userReply: string;
  safetyInstructions?: string[];
  userTroubleshootingSteps?: string[];
  estimatedResponseWindow?: string;
  requiresTechnician?: boolean;
  immediateActionRequired?: boolean;
  ticketUrl: string;
}) {
  const priority = formatPriority(args.ticketPriority);
  const location = locationLabel(args.propertyName, args.unitLabel);
  const tone = args.immediateActionRequired
    ? "danger"
    : priorityTone(args.ticketPriority);
  const headline = args.immediateActionRequired
    ? "Please review the safety guidance now"
    : args.requiresTechnician
      ? "Your request is moving toward technician review"
      : "Your request has been reviewed";
  const headlineDescription = args.immediateActionRequired
    ? "The triage check found items that may need prompt attention. Follow the safety guidance below and contact your property team if the situation changes."
    : args.requiresTechnician
      ? "We have added the assessment to your ticket so the property team can continue coordinating the next step."
      : "We have added the assessment to your ticket and will keep the request history updated.";

  return `
    ${buildGenericEmailBadge({
      label: "Maintenance Triage",
      tone,
      secondaryLabel: priority,
    })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `We reviewed your maintenance request <strong style="color:#0f172a;">${escapeHtml(args.ticketTitle)}</strong> and added the assessment to your ticket.`,
    })}
    ${buildGenericEmailBanner({
      title: headline,
      description: headlineDescription,
      tone,
    })}
    ${buildGenericDetailsGrid({
      items: [
        { label: "Ticket", value: args.ticketTitle, fullWidth: true },
        { label: "Priority", value: priority },
        { label: "Location", value: location || "Not provided" },
        ...(args.estimatedResponseWindow
          ? [{ label: "Expected response", value: args.estimatedResponseWindow }]
          : []),
        {
          label: "Technician review",
          value: args.requiresTechnician ? "Likely needed" : "Not currently required",
        },
      ],
    })}
    ${buildAssessmentPanel(args.userReply)}
    ${buildBulletPanel({
      title: "Safety guidance",
      items: args.safetyInstructions,
      tone: args.immediateActionRequired ? "danger" : "warning",
    })}
    ${buildBulletPanel({
      title: "Helpful steps while you wait",
      items: args.userTroubleshootingSteps,
      tone: "neutral",
    })}
    ${buildGenericInfoPanel({
      title: "Track this request",
      description:
        "Open the ticket to see status changes, updates from the property team, and any technician scheduling details.",
      tone: "info",
      actionLabel: "Open Ticket",
      actionUrl: args.ticketUrl,
      actionAsButton: true,
      note: "If the issue becomes urgent, reply to this email or contact your property team directly.",
    })}
    ${buildGenericKeyValueTable({
      title: "What happens next",
      rows: [
        {
          label: "1",
          value: "Your property team reviews the assessment and confirms the next action.",
        },
        {
          label: "2",
          value: args.requiresTechnician
            ? "If needed, a technician will be assigned or requested for availability."
            : "If no technician is needed, the team will update the ticket with instructions or resolution notes.",
        },
        {
          label: "3",
          value: "You will receive updates as the ticket moves forward.",
        },
      ],
    })}
  `;
}

export async function sendTenantTriageCompleteEmail(args: {
  request: NextRequest;
  businessId: string;
  tenantUserId: string;
  ticketSlug: string;
  ticketTitle: string;
  ticketPriority: string;
  propertyName?: string;
  unitLabel?: string;
  userReply?: string;
  safetyInstructions?: string[];
  userTroubleshootingSteps?: string[];
  estimatedResponseWindow?: string;
  requiresTechnician?: boolean;
  immediateActionRequired?: boolean;
}) {
  if (!args.userReply?.trim()) {
    return { sent: false, skippedReason: "AI produced no userReply" };
  }

  const tenant = await findTicketTenant(args.tenantUserId);
  if (!tenant) {
    return { sent: false, skippedReason: "Tenant user not found or has no email" };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const ticketUrl = `${baseUrl}/dashboard/ticket-management/${args.ticketSlug}`;

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
      safety_instructions_block: buildTextListBlock(
        "Important safety steps to take now",
        args.safetyInstructions,
      ),
      user_troubleshooting_steps_block: buildTextListBlock(
        "Helpful steps while you wait",
        args.userTroubleshootingSteps,
      ),
      estimated_response_window: args.estimatedResponseWindow ?? "",
      requires_technician: args.requiresTechnician ? "Yes" : "No",
      immediate_action_required: args.immediateActionRequired ? "Yes" : "No",
      ticket_url: ticketUrl,
    },
    customBodyHtml: buildTenantTriageEmailHtml({
      attendeeName: tenant.name,
      ticketTitle: args.ticketTitle,
      ticketPriority: args.ticketPriority,
      propertyName: args.propertyName,
      unitLabel: args.unitLabel,
      userReply: args.userReply.trim(),
      safetyInstructions: args.safetyInstructions,
      userTroubleshootingSteps: args.userTroubleshootingSteps,
      estimatedResponseWindow: args.estimatedResponseWindow,
      requiresTechnician: args.requiresTechnician,
      immediateActionRequired: args.immediateActionRequired,
      ticketUrl,
    }),
  });
}
