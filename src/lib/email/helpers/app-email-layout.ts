import { escapeHtml } from "@/lib/email/helpers/email-html";

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
  const toneColor = args.tone === "warning" ? "#d97706" : "#2563eb";

  return `
    <div style="display:inline-block;margin-bottom:16px;border-radius:999px;background:${toneColor}14;color:${toneColor};font-size:12px;font-weight:700;padding:6px 10px;">${escapeHtml(args.badgeLabel)}</div>
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${escapeHtml(args.attendeeName)},</p>
    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#334155;">${escapeHtml(args.intro)}</p>
    <div style="margin:20px 0;padding:18px;border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;">
      <h2 style="margin:0 0 8px 0;font-size:18px;color:#0f172a;">${escapeHtml(args.actionTitle)}</h2>
      <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#475569;">${escapeHtml(args.actionDescription)}</p>
      <a href="${escapeHtml(args.actionUrl)}" style="display:inline-block;border-radius:8px;background:${toneColor};color:#ffffff;text-decoration:none;font-weight:700;padding:10px 16px;">${escapeHtml(args.actionLabel)}</a>
      ${
        args.expiryLabel
          ? `<p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">Expires in ${escapeHtml(args.expiryLabel)}.</p>`
          : ""
      }
    </div>
    ${
      args.safetyTitle || args.safetyDescription
        ? `<div style="margin-top:18px;padding:14px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;">
            <p style="margin:0 0 6px 0;font-size:14px;font-weight:700;color:#9a3412;">${escapeHtml(args.safetyTitle ?? "Security notice")}</p>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#9a3412;">${escapeHtml(args.safetyDescription ?? "")}</p>
          </div>`
        : ""
    }
  `;
}

export function buildPasscodeEmailHtml(args: {
  attendeeName: string;
  passcode: string;
  expiresMinutes: string;
}) {
  return `
    <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${escapeHtml(args.attendeeName)},</p>
    <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#334155;">Use this code to finish changing your password.</p>
    <div style="margin:18px 0;padding:20px;border-radius:10px;background:#f1f5f9;text-align:center;font-size:32px;letter-spacing:8px;font-weight:800;color:#0f172a;">${escapeHtml(args.passcode)}</div>
    <p style="margin:0;font-size:13px;color:#64748b;">This code expires in ${escapeHtml(args.expiresMinutes)} minutes.</p>
  `;
}

export function buildTeamInviteEmailHtml(args: {
  attendeeName: string;
  workspaceName: string;
  inviteUrl: string;
  expiresHours: string;
}) {
  return buildSecureActionEmailHtml({
    badgeLabel: "Workspace Invite",
    attendeeName: args.attendeeName,
    intro: `You have been invited to join ${args.workspaceName} on Maintainly.`,
    actionTitle: "Complete your onboarding",
    actionDescription:
      "Use the secure link below to accept your invite and access the workspace.",
    actionLabel: "Accept Invite",
    actionUrl: args.inviteUrl,
    expiryLabel: `${args.expiresHours} hours`,
    tone: "info",
  });
}
