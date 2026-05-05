import { escapeHtml } from "@/lib/email/helpers/email-html";
import {
  buildGenericCodeCard,
  buildGenericDetailsGrid,
  buildGenericEmailBadge,
  buildGenericEmailBanner,
  buildGenericEmailLead,
  buildGenericInfoPanel,
  buildGenericKeyValueTable,
} from "@/lib/email/helpers/generic-email-layout";

function normalizeWorkspaceLabel(workspaceLabel: string) {
  const normalized = workspaceLabel.trim();
  return normalized.length ? normalized : "Workspace";
}

function buildWorkspaceDetails(args: {
  workspaceName: string;
  workspaceLabel: string;
  workspaceRole?: string;
  extraItems?: Array<{ label: string; value: string }>;
}) {
  return buildGenericDetailsGrid({
    stacked: true,
    items: [
      { label: "Workspace", value: args.workspaceName },
      { label: "Type", value: args.workspaceLabel },
      ...(args.workspaceRole
        ? [{ label: "Role", value: args.workspaceRole }]
        : []),
      ...(args.extraItems ?? []),
    ],
  });
}

export function buildWorkspaceReadyEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  workspaceLabel: string;
  workspaceRole: string;
  dashboardUrl: string;
  loginUrl: string;
}) {
  const workspaceLabel = normalizeWorkspaceLabel(args.workspaceLabel);

  return `
    ${buildGenericEmailBadge({ label: "Workspace Ready", tone: "success" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `Your ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong> has been created successfully.`,
    })}
    ${buildGenericEmailBanner({
      title: "Your workspace is ready to go",
      description:
        "You can add properties, invite teammates, and start managing maintenance tickets from the dashboard.",
      tone: "success",
    })}
    ${buildWorkspaceDetails({
      workspaceName: args.workspaceName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
    })}
    ${buildGenericInfoPanel({
      title: "Open your dashboard",
      description: "Jump into the workspace to add your first property or invite your team.",
      tone: "info",
      actionLabel: "Open Dashboard",
      actionUrl: args.dashboardUrl,
      actionAsButton: true,
      note: "If you need to sign in again first, you can also use the login link below.",
    })}
    <p style="margin:0 0 24px 0;font-size:12px;color:#6b7280;line-height:1.6;">
      Need to sign in first? <a href="${args.loginUrl}" target="_blank" rel="noopener noreferrer" style="color:#c2410c;text-decoration:none;font-weight:500;">Log in</a>.
    </p>
  `;
}

export function buildAdditionalWorkspaceCreatedEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  workspaceLabel: string;
  workspaceRole: string;
  dashboardUrl: string;
  loginUrl: string;
}) {
  const workspaceLabel = normalizeWorkspaceLabel(args.workspaceLabel);

  return `
    ${buildGenericEmailBadge({ label: "Workspace Added", tone: "success" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `Your new ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong> has been added to your account.`,
    })}
    ${buildGenericEmailBanner({
      title: "Switch into your new workspace",
      description:
        "Use the workspace switcher from the dashboard to move into this workspace and continue setup.",
      tone: "success",
    })}
    ${buildWorkspaceDetails({
      workspaceName: args.workspaceName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
    })}
    ${buildGenericInfoPanel({
      title: "Open the dashboard",
      description: "Your account can access this workspace immediately from the dashboard.",
      tone: "info",
      actionLabel: "Open Dashboard",
      actionUrl: args.dashboardUrl,
      actionAsButton: true,
      note: "If you need to authenticate first, you can use the sign-in link below.",
    })}
    <p style="margin:0 0 24px 0;font-size:12px;color:#6b7280;line-height:1.6;">
      Need to sign in first? <a href="${args.loginUrl}" target="_blank" rel="noopener noreferrer" style="color:#c2410c;text-decoration:none;font-weight:500;">Log in</a>.
    </p>
  `;
}

export function buildWorkspaceAccessStatusEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  workspaceLabel: string;
  active: boolean;
  loginUrl?: string;
}) {
  const isActive = args.active;
  const workspaceLabel = normalizeWorkspaceLabel(args.workspaceLabel);

  return `
    ${buildGenericEmailBadge({
      label: isActive ? "Workspace Reactivated" : "Workspace Deactivated",
      tone: isActive ? "success" : "warning",
    })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: isActive
        ? `Your ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong> has been reactivated and access has been restored.`
        : `Your ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong> has been deactivated and access has been paused.`,
    })}
    ${buildGenericInfoPanel({
      title: isActive ? "Access has been restored" : "Access has been paused",
      description: isActive
        ? "Workspace members can sign in again, return to the dashboard, and resume operations."
        : "Workspace members can no longer access this workspace until it is reactivated; existing sessions will stop on the next protected request.",
      tone: isActive ? "success" : "warning",
      actionLabel: isActive ? "Sign In" : undefined,
      actionUrl: isActive ? args.loginUrl : undefined,
      actionAsButton: true,
    })}
    ${buildGenericKeyValueTable({
      title: "Workspace Summary",
      rows: [
        { label: "Workspace", value: args.workspaceName, highlighted: true },
        { label: "Type", value: workspaceLabel },
        {
          label: "Current access",
          value: isActive ? "Active" : "Paused",
          emphasized: true,
        },
      ],
    })}
  `;
}

export function buildWorkspaceUpgradedEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  previousWorkspaceLabel: string;
  workspaceLabel: string;
  dashboardUrl: string;
  loginUrl: string;
}) {
  return `
    ${buildGenericEmailBadge({ label: "Workspace Upgraded", tone: "success" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `Your workspace <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong> is now a ${escapeHtml(args.workspaceLabel.toLowerCase())}.`,
    })}
    ${buildGenericEmailBanner({
      title: "Collaboration features are now available",
      description:
        "You can now invite teammates, assign workspace roles, and manage this workspace with business collaboration enabled.",
      tone: "success",
    })}
    ${buildWorkspaceDetails({
      workspaceName: args.workspaceName,
      workspaceLabel: args.workspaceLabel,
      extraItems: [
        { label: "Upgraded from", value: args.previousWorkspaceLabel },
      ],
    })}
    ${buildGenericInfoPanel({
      title: "Review workspace settings",
      description:
        "Open the dashboard to invite teammates, confirm access controls, and continue configuring this workspace.",
      tone: "info",
      actionLabel: "Open Dashboard",
      actionUrl: args.dashboardUrl,
      actionAsButton: true,
      note: "If you need to sign in again first, you can also use the login link below.",
    })}
    <p style="margin:0 0 24px 0;font-size:12px;color:#6b7280;line-height:1.6;">
      Need to sign in first? <a href="${args.loginUrl}" target="_blank" rel="noopener noreferrer" style="color:#c2410c;text-decoration:none;font-weight:500;">Log in</a>.
    </p>
  `;
}

export function buildSecureActionEmailHtml(args: {
  badgeLabel: string;
  attendeeName: string;
  intro: string;
  actionTitle: string;
  actionDescription: string;
  actionLabel: string;
  actionUrl: string;
  expiryLabel?: string;
  tone?: "info" | "warning" | "success";
  safetyTitle?: string;
  safetyDescription?: string;
}) {
  const detailItems = args.expiryLabel
    ? [{ label: "Expires", value: args.expiryLabel }]
    : [];

  return `
    ${buildGenericEmailBadge({ label: args.badgeLabel, tone: args.tone ?? "info" })}
    ${buildGenericEmailLead({ attendeeName: args.attendeeName, intro: args.intro })}
    ${detailItems.length ? buildGenericDetailsGrid({ items: detailItems }) : ""}
    ${buildGenericInfoPanel({
      title: args.actionTitle,
      description: args.actionDescription,
      tone: args.tone ?? "info",
      actionLabel: args.actionLabel,
      actionUrl: args.actionUrl,
      actionAsButton: true,
    })}
    ${
      args.safetyTitle && args.safetyDescription
        ? buildGenericInfoPanel({
            title: args.safetyTitle,
            description: args.safetyDescription,
            tone: "neutral",
          })
        : ""
    }
  `;
}

export function buildTeamInviteEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  workspaceLabel?: string;
  inviteUrl: string;
  expiresHours: string;
}) {
  const workspaceLabel = normalizeWorkspaceLabel(args.workspaceLabel ?? "Workspace");

  return `
    ${buildGenericEmailBadge({ label: "Team Invite", tone: "info" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `You have been invited to join the ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong>.`,
    })}
    ${buildWorkspaceDetails({
      workspaceName: args.workspaceName,
      workspaceLabel,
      extraItems: [
        { label: "Invite expires", value: `${escapeHtml(args.expiresHours)} hours` },
      ],
    })}
    ${buildGenericInfoPanel({
      title: "Complete your onboarding",
      description: "Use the secure invite link below to finish onboarding and access the workspace.",
      tone: "info",
      actionLabel: "Accept Invite",
      actionUrl: args.inviteUrl,
      actionAsButton: true,
    })}
  `;
}

export function buildTeamWelcomeEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  workspaceLabel: string;
  workspaceRole: string;
  dashboardUrl: string;
  loginUrl: string;
}) {
  const workspaceLabel = normalizeWorkspaceLabel(args.workspaceLabel);

  return `
    ${buildGenericEmailBadge({ label: "Workspace Access Active", tone: "success" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: `Welcome to the ${escapeHtml(workspaceLabel.toLowerCase())} <strong style="color:#0f172a;">${escapeHtml(args.workspaceName)}</strong>. Your workspace access is now active.`,
    })}
    ${buildWorkspaceDetails({
      workspaceName: args.workspaceName,
      workspaceLabel,
      workspaceRole: args.workspaceRole,
    })}
    ${buildGenericInfoPanel({
      title: "Start using your workspace",
      description: "Head into the dashboard to review tickets, team operations, and workspace settings.",
      tone: "success",
      actionLabel: "Open Dashboard",
      actionUrl: args.dashboardUrl,
      actionAsButton: true,
      note: "If you need to authenticate first, you can use the sign-in link below.",
    })}
    <p style="margin:0 0 24px 0;font-size:12px;color:#6b7280;line-height:1.6;">
      Need to sign in first? <a href="${args.loginUrl}" target="_blank" rel="noopener noreferrer" style="color:#c2410c;text-decoration:none;font-weight:500;">Log in</a>.
    </p>
  `;
}

export function buildPasscodeEmailHtml(args: {
  attendeeName: string;
  passcode: string;
  expiresMinutes: string;
}) {
  return `
    ${buildGenericEmailBadge({ label: "Verification Code", tone: "info" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: "Use the verification code below to complete your password update.",
    })}
    ${buildGenericCodeCard({
      title: "Password change passcode",
      code: args.passcode,
      tone: "info",
      note: `This code expires in ${escapeHtml(args.expiresMinutes)} minutes.`,
    })}
    ${buildGenericInfoPanel({
      title: "Did not request this?",
      description: "If you did not request a password update, you can ignore this email and keep your account secure.",
      tone: "neutral",
    })}
  `;
}

export function buildPasswordUpdatedEmailHtml(args: {
  attendeeName: string;
  loginUrl: string;
}) {
  return `
    ${buildGenericEmailBadge({ label: "Password Updated", tone: "success" })}
    ${buildGenericEmailLead({
      attendeeName: args.attendeeName,
      intro: "Your account password was updated successfully.",
    })}
    ${buildGenericInfoPanel({
      title: "Password change confirmed",
      description: "If you made this change, no further action is needed.",
      tone: "success",
    })}
    ${buildGenericInfoPanel({
      title: "Did not make this change?",
      description: "Reset your password immediately and contact support if you believe your account was accessed without permission.",
      tone: "warning",
      actionLabel: "Go to Sign In",
      actionUrl: args.loginUrl,
      actionAsButton: true,
    })}
  `;
}
