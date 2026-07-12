import type { NextRequest } from "next/server";

import { sendBusinessTemplateEmail } from "@/lib/email/clients/business-email.client";
import { resolveAppBaseUrl } from "@/lib/email/helpers/app-url";
import { escapeHtml } from "@/lib/email/helpers/email-html";
import {
  buildGenericDetailsGrid,
  buildGenericEmailBadge,
  buildGenericEmailBanner,
  buildGenericEmailLead,
  buildGenericInfoPanel,
  buildGenericKeyValueTable,
} from "@/lib/email/helpers/generic-email-layout";
import WorkspaceMembership from "@/models/workspaceMembershipModel";
import User from "@/models/userModel";
import { BUSINESS_EMAIL_TEMPLATE } from "@/shared/enums/email-template";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import { MEMBERSHIP_STATUS, WORKSPACE_ROLE } from "@/shared/auth/roles";

type AdminRecipient = { name: string; email: string };
type AdminEmailTone = "success" | "info" | "warning" | "danger" | "neutral";

const ADMIN_WORKSPACE_ROLES = [
  WORKSPACE_ROLE.owner,
  WORKSPACE_ROLE.property_manager,
  WORKSPACE_ROLE.maintenance_coordinator,
  ROLES.owner,
  ROLES.admin,
  ROLES.super_admin,
];

async function findBusinessAdminRecipients(
  businessId: string,
): Promise<AdminRecipient[]> {
  const legacyUsersPromise = User.find({
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

  const workspaceMembershipsPromise = WorkspaceMembership.find({
    workspace: businessId,
    status: MEMBERSHIP_STATUS.active,
    role: { $in: ADMIN_WORKSPACE_ROLES },
  })
    .select("user")
    .lean<Array<{ user?: unknown }>>();

  const [legacyUsers, workspaceMemberships] = await Promise.all([
    legacyUsersPromise,
    workspaceMembershipsPromise,
  ]);
  const workspaceUserIds = workspaceMemberships
    .map((membership) => membership.user)
    .filter(Boolean);
  const workspaceUsers = workspaceUserIds.length
    ? await User.find({ _id: { $in: workspaceUserIds } })
        .select("name email")
        .lean<Array<{ name?: string; email?: string }>>()
    : [];

  const recipientsByEmail = new Map<string, AdminRecipient>();
  for (const user of [...legacyUsers, ...workspaceUsers]) {
    if (!user.email) continue;
    recipientsByEmail.set(user.email.toLowerCase(), {
      name: user.name?.trim() || "Team",
      email: user.email,
    });
  }

  return Array.from(recipientsByEmail.values());
}

function formatLabel(value?: string | null, fallback = "Not provided") {
  if (!value?.trim()) return fallback;
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function priorityTone(priority: string): AdminEmailTone {
  if (priority === "EMERGENCY") return "danger";
  if (priority === "HIGH") return "warning";
  return "info";
}

function locationLabel(propertyName?: string, unitLabel?: string) {
  return [propertyName, unitLabel].filter((value) => value?.trim()).join(" · ");
}

function buildTextListBlock(title: string, items?: string[]): string {
  if (!items?.length) return "";
  const bullets = items
    .map((item) => `- ${item}`)
    .join("\n");
  return `${title}:\n${bullets}`;
}

function buildHiddenPreheader(preheader: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>`;
}

function buildMissingInformationPanel(items?: string[]) {
  const missingInformation = items?.filter((item) => item.trim()) ?? [];
  if (!missingInformation.length) return "";

  const itemsHtml = missingInformation
    .map(
      (item) => `
        <li style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#9a3412;">
          ${escapeHtml(item)}
        </li>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1a1a2e;">
            Information requested from tenant
          </p>
          <ul style="margin:0;padding-left:18px;">
            ${itemsHtml}
          </ul>
        </td>
      </tr>
    </table>
  `;
}

function buildAdminNotesPanel(adminNotes?: string) {
  const notes = adminNotes?.trim() || "No additional admin notes were provided.";
  const paragraphs = notes
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `
        <p style="margin:0 0 12px 0;font-size:13px;line-height:1.65;color:#334155;">
          ${escapeHtml(paragraph).replace(/\n/g, "<br />")}
        </p>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1a1a2e;">
            Admin triage notes
          </p>
          ${paragraphs}
        </td>
      </tr>
    </table>
  `;
}

function buildAdminMissingInformationEmailHtml(args: {
  attendeeName: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketCategory?: string;
  recommendedTicketType?: string;
  propertyName?: string;
  unitLabel?: string;
  missingInformation: string[];
  adminNotes?: string;
  estimatedResponseWindow?: string;
  ticketUrl: string;
}) {
  const priority = formatLabel(args.ticketPriority);
  const location = locationLabel(args.propertyName, args.unitLabel);

  return `
    ${buildHiddenPreheader("Additional information needed before re-triage.")}
    ${buildGenericEmailBadge({
      label: "Additional Information Needed",
      tone: "warning",
      secondaryLabel: priority,
    })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `A maintenance request has been received for <strong style="color:#0f172a;">${escapeHtml(args.ticketTitle)}</strong>, but AI triage needs more tenant information before the request can be finalized.`,
    })}
    ${buildGenericEmailBanner({
      title: "Tenant has been asked to update the ticket",
      description:
        "The tenant has been notified to go to the maintenance dashboard and update the ticket information with the missing details. A re-triage is needed after those details are provided.",
      tone: "warning",
    })}
    ${buildGenericDetailsGrid({
      stacked: true,
      items: [
        { label: "Ticket", value: args.ticketTitle },
        { label: "Priority", value: priority },
        { label: "Location", value: location || "Not provided" },
        { label: "Category", value: args.ticketCategory || "Uncategorised" },
        {
          label: "Recommended type",
          value: formatLabel(args.recommendedTicketType, "Pending re-triage"),
        },
        {
          label: "Tenant communication",
          value: "Additional information request sent",
        },
        {
          label: "Re-triage",
          value: "Required after tenant updates the ticket",
        },
        ...(args.estimatedResponseWindow
          ? [{ label: "Response window", value: args.estimatedResponseWindow }]
          : []),
      ],
    })}
    ${buildMissingInformationPanel(args.missingInformation)}
    ${buildAdminNotesPanel(args.adminNotes)}
    ${buildGenericInfoPanel({
      title: "Re-triage required",
      description:
        "Once the tenant updates the ticket information, run or trigger triage again so the request can be classified with the complete details.",
      tone: "info",
      actionLabel: "Open Ticket",
      actionUrl: args.ticketUrl,
      actionAsButton: true,
    })}
    ${buildGenericKeyValueTable({
      title: "Suggested workflow",
      rows: [
        {
          label: "1",
          value: "Monitor the ticket for the tenant's updated information.",
        },
        {
          label: "2",
          value: "Review the new details and re-run triage.",
        },
        {
          label: "3",
          value: "Confirm priority, ticket type, and dispatch path after re-triage completes.",
        },
      ],
    })}
  `;
}

function buildAdminTriageEmailHtml(args: {
  attendeeName: string;
  ticketTitle: string;
  ticketPriority: string;
  ticketCategory?: string;
  recommendedTicketType?: string;
  propertyName?: string;
  unitLabel?: string;
  missingInformation?: string[];
  needsHumanReview?: boolean;
  adminNotes?: string;
  requiresTechnician?: boolean;
  immediateActionRequired?: boolean;
  estimatedResponseWindow?: string;
  ticketUrl: string;
}) {
  const priority = formatLabel(args.ticketPriority);
  const tone = args.immediateActionRequired
    ? "danger"
    : priorityTone(args.ticketPriority);
  const location = locationLabel(args.propertyName, args.unitLabel);

  return `
    ${buildGenericEmailBadge({
      label: "AI Triage Complete",
      tone,
      secondaryLabel: priority,
    })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `AI triage is complete for <strong style="color:#0f172a;">${escapeHtml(args.ticketTitle)}</strong>. Review the assessment and route the request from the ticket workspace.`,
    })}
    ${buildGenericEmailBanner({
      title: args.immediateActionRequired
        ? "Immediate admin review recommended"
        : "Ticket is ready for admin review",
      description: args.immediateActionRequired
        ? "The triage result flagged this request for prompt attention. Open the ticket to review safety notes and dispatch next steps."
        : "The triage result has been saved to the ticket and is ready for dispatch, assignment, or follow-up.",
      tone,
    })}
    ${buildGenericDetailsGrid({
      stacked: true,
      items: [
        { label: "Ticket", value: args.ticketTitle },
        { label: "Priority", value: priority },
        { label: "Location", value: location || "Not provided" },
        { label: "Category", value: args.ticketCategory || "Uncategorised" },
        {
          label: "Recommended type",
          value: formatLabel(args.recommendedTicketType, "Not set"),
        },
        {
          label: "Human review",
          value: args.needsHumanReview ? "Required" : "Not flagged",
        },
        {
          label: "Technician review",
          value: args.requiresTechnician
            ? "Likely needed"
            : "Not currently required",
        },
        ...(args.estimatedResponseWindow
          ? [{ label: "Response window", value: args.estimatedResponseWindow }]
          : []),
      ],
    })}
    ${buildAdminNotesPanel(args.adminNotes)}
    ${buildGenericInfoPanel({
      title: "Open the ticket",
      description:
        "Review the AI assessment, confirm the recommended type, and assign or dispatch the request.",
      tone: "info",
      actionLabel: "Open Ticket",
      actionUrl: args.ticketUrl,
      actionAsButton: true,
    })}
    ${buildGenericKeyValueTable({
      title: "Suggested workflow",
      rows: [
        {
          label: "1",
          value: "Review the AI assessment and tenant-facing summary.",
        },
        {
          label: "2",
          value: "Confirm the priority, category, and ticket type.",
        },
        {
          label: "3",
          value: "Assign internally or request a technician response.",
        },
      ],
    })}
  `;
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
  missingInformation?: string[];
  requiresTechnician?: boolean;
  immediateActionRequired?: boolean;
  estimatedResponseWindow?: string;
}) {
  const recipients = await findBusinessAdminRecipients(args.businessId);
  if (recipients.length === 0) {
    return { sent: false, skippedReason: "No active workspace admins found" };
  }

  const baseUrl = resolveAppBaseUrl(args.request);
  const ticketUrl = `${baseUrl}/dashboard/tickets/${args.ticketSlug}`;
  const missingInformation =
    args.missingInformation
      ?.map((item) => item.trim())
      .filter(Boolean) ?? [];
  const needsMoreInformation = missingInformation.length > 0;

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendBusinessTemplateEmail({
        businessId: args.businessId,
        templateKey: BUSINESS_EMAIL_TEMPLATE.TICKET_AI_TRIAGE_COMPLETE,
        to: recipient.email,
        fallbackSubject: needsMoreInformation
          ? `[${args.ticketPriority}] Additional information needed: ${args.ticketTitle}`
          : `[${args.ticketPriority}] AI triage complete: ${args.ticketTitle}`,
        subjectOverride: needsMoreInformation
          ? "[{{ticket_priority}}] Additional information needed: {{ticket_title}}"
          : undefined,
        preheaderOverride: needsMoreInformation
          ? "Tenant has been asked to update the ticket. Re-triage is needed."
          : undefined,
        variables: {
          attendee_name: recipient.name,
          ticket_title: args.ticketTitle,
          ticket_priority: args.ticketPriority,
          ticket_category: args.ticketCategory ?? "Uncategorised",
          recommended_ticket_type: args.recommendedTicketType ?? "—",
          property_name: args.propertyName ?? "",
          unit_label: args.unitLabel ?? "",
          needs_human_review: args.needsHumanReview ? "Yes" : "No",
          requires_technician: args.requiresTechnician ? "Yes" : "No",
          immediate_action_required: args.immediateActionRequired ? "Yes" : "No",
          estimated_response_window: args.estimatedResponseWindow ?? "",
          admin_notes: args.adminNotes?.trim() || "No additional notes.",
          missing_information_block: buildTextListBlock(
            "Information requested from tenant",
            missingInformation,
          ),
          tenant_communication_status: needsMoreInformation
            ? "The tenant has been asked to update the ticket from the maintenance dashboard."
            : "",
          retriage_status: needsMoreInformation
            ? "Re-triage is required after the tenant updates the ticket."
            : "",
          ticket_url: ticketUrl,
        },
        customBodyHtml: needsMoreInformation
          ? buildAdminMissingInformationEmailHtml({
              attendeeName: recipient.name,
              ticketTitle: args.ticketTitle,
              ticketPriority: args.ticketPriority,
              ticketCategory: args.ticketCategory,
              recommendedTicketType: args.recommendedTicketType,
              propertyName: args.propertyName,
              unitLabel: args.unitLabel,
              missingInformation,
              adminNotes: args.adminNotes,
              estimatedResponseWindow: args.estimatedResponseWindow,
              ticketUrl,
            })
          : buildAdminTriageEmailHtml({
              attendeeName: recipient.name,
              ticketTitle: args.ticketTitle,
              ticketPriority: args.ticketPriority,
              ticketCategory: args.ticketCategory,
              recommendedTicketType: args.recommendedTicketType,
              propertyName: args.propertyName,
              unitLabel: args.unitLabel,
              needsHumanReview: args.needsHumanReview,
              adminNotes: args.adminNotes,
              requiresTechnician: args.requiresTechnician,
              immediateActionRequired: args.immediateActionRequired,
              estimatedResponseWindow: args.estimatedResponseWindow,
              ticketUrl,
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
