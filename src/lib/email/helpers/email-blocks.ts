import { escapeHtml } from "@/lib/email/helpers/email-html";
import {
  EMAIL_BORDER_COLOR,
  EMAIL_FONT_STACK,
  EMAIL_LINK_COLOR,
  EMAIL_MUTED_TEXT_COLOR,
  EMAIL_SURFACE_SUBTLE,
  EMAIL_TEXT_COLOR,
} from "@/lib/email/helpers/email-theme";

type DetailItem = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

type TableSectionArgs = {
  title?: string;
  introHtml?: string;
  headers?: string[];
  rows: string[][];
  compact?: boolean;
};

export function buildEmailStatusBadge(label: string) {
  return `
    <div style="margin:0 0 18px 0;">
      <span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;background:#eff6ff;color:${EMAIL_LINK_COLOR};font-family:${EMAIL_FONT_STACK};font-size:11px;line-height:1;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
        ${escapeHtml(label)}
      </span>
    </div>
  `;
}

function buildDetailCard(item: DetailItem) {
  return `
    <div style="background:${EMAIL_SURFACE_SUBTLE};border-radius:12px;padding:14px 14px 13px;">
      <div style="margin:0 0 6px 0;font-family:${EMAIL_FONT_STACK};font-size:10px;line-height:1.2;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL_MUTED_TEXT_COLOR};">
        ${escapeHtml(item.label)}
      </div>
      <div style="font-family:${EMAIL_FONT_STACK};font-size:13px;line-height:1.55;font-weight:600;color:${EMAIL_TEXT_COLOR};">
        ${escapeHtml(item.value)}
      </div>
    </div>
  `;
}

export function buildEmailDetailsGrid(items: DetailItem[]) {
  const halfWidthItems = items.filter((item) => !item.fullWidth);
  const fullWidthItems = items.filter((item) => item.fullWidth);
  const rows: string[] = [];

  for (let index = 0; index < halfWidthItems.length; index += 2) {
    const left = halfWidthItems[index];
    const right = halfWidthItems[index + 1];
    rows.push(`
      <tr>
        <td style="width:50%;padding:0 6px 12px 0;vertical-align:top;">
          ${buildDetailCard(left)}
        </td>
        <td style="width:50%;padding:0 0 12px 6px;vertical-align:top;">
          ${right ? buildDetailCard(right) : ""}
        </td>
      </tr>
    `);
  }

  for (const item of fullWidthItems) {
    rows.push(`
      <tr>
        <td colspan="2" style="padding:0 0 12px 0;vertical-align:top;">
          ${buildDetailCard(item)}
        </td>
      </tr>
    `);
  }

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:0 0 18px 0;">
      ${rows.join("")}
    </table>
  `;
}

export function buildEmailActionSection(args: {
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
}) {
  return `
    <div style="margin-top:8px;padding:16px 16px 15px;border:1px solid rgba(29,78,216,0.14);border-radius:14px;background:#f8fbff;">
      <div style="margin:0 0 6px 0;font-family:${EMAIL_FONT_STACK};font-size:14px;line-height:1.4;font-weight:700;color:${EMAIL_TEXT_COLOR};">
        ${escapeHtml(args.title)}
      </div>
      <p style="margin:0 0 12px 0;font-size:12px;line-height:1.7;color:#475569;">
        ${escapeHtml(args.description)}
      </p>
      <a
        href="${escapeHtml(args.actionUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        style="display:inline-block;color:${EMAIL_LINK_COLOR};text-decoration:none;font-family:${EMAIL_FONT_STACK};font-size:12px;line-height:1.2;font-weight:700;"
      >
        ${escapeHtml(args.actionLabel)}
      </a>
    </div>
  `;
}

export function buildEmailSectionDivider() {
  return `<div style="margin:18px 0 0 0;padding-top:18px;border-top:1px solid ${EMAIL_BORDER_COLOR};"></div>`;
}

export function buildEmailTableSection(args: TableSectionArgs) {
  const cellPadding = args.compact ? "8px 10px" : "10px 12px";
  const headerHtml = args.headers?.length
    ? `<thead>
        <tr>
          ${args.headers
            .map(
              (header) => `<th style="text-align:left;padding:${cellPadding};border-bottom:1px solid ${EMAIL_BORDER_COLOR};background:#f8fafc;font-family:${EMAIL_FONT_STACK};font-size:13px;line-height:1.5;font-weight:600;color:${EMAIL_MUTED_TEXT_COLOR};">
                ${escapeHtml(header)}
              </th>`,
            )
            .join("")}
        </tr>
      </thead>`
    : "";

  const bodyHtml = args.rows
    .map(
      (row, rowIndex) => `<tr>
        ${row
          .map(
            (cell) => `<td style="padding:${cellPadding};${
              rowIndex > 0 ? `border-top:1px solid ${EMAIL_BORDER_COLOR};` : ""
            }font-size:13px;line-height:1.6;color:#334155;vertical-align:top;">
              ${cell}
            </td>`,
          )
          .join("")}
      </tr>`,
    )
    .join("");

  return `
    <div style="margin:0 0 18px 0;">
      ${
        args.title
          ? `<div style="margin:0 0 8px 0;font-family:${EMAIL_FONT_STACK};font-size:13px;line-height:1.5;font-weight:600;color:${EMAIL_TEXT_COLOR};">
              ${escapeHtml(args.title)}
            </div>`
          : ""
      }
      ${args.introHtml ?? ""}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid ${EMAIL_BORDER_COLOR};border-radius:12px;overflow:hidden;">
        ${headerHtml}
        <tbody>${bodyHtml}</tbody>
      </table>
    </div>
  `;
}

export function buildEmailKeyValueSection(args: {
  title?: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return buildEmailTableSection({
    title: args.title,
    rows: args.rows.map((row) => [
      `<span style="color:${EMAIL_MUTED_TEXT_COLOR};font-weight:500;">${escapeHtml(
        row.label,
      )}</span>`,
      `<span style="font-weight:400;color:${EMAIL_TEXT_COLOR};">${escapeHtml(
        row.value,
      )}</span>`,
    ]),
    compact: true,
  });
}

export function buildEmailEventDetailsSection(args: {
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  includeEventName?: boolean;
  title?: string;
}) {
  const rows = [
    args.includeEventName !== false
      ? { label: "Event", value: args.eventName }
      : null,
    args.eventDate ? { label: "Date", value: args.eventDate } : null,
    args.eventTime ? { label: "Time", value: args.eventTime } : null,
    {
      label: "Location",
      value: args.eventLocation?.trim() || "TBD",
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return buildEmailKeyValueSection({
    title: args.title ?? "Event Details",
    rows,
  });
}
