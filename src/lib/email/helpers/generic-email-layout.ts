import { escapeHtml } from "@/lib/email/helpers/email-html";

type GenericEmailTone = "success" | "info" | "warning" | "danger" | "neutral";

const GENERIC_EMAIL_TONES: Record<
  GenericEmailTone,
  {
    badgeBg: string;
    badgeText: string;
    panelBg: string;
    panelBorder: string;
    panelText: string;
    buttonBg: string;
  }
> = {
  success: {
    badgeBg: "rgba(16, 185, 129, 0.1)",
    badgeText: "#10b981",
    panelBg: "rgba(16, 185, 129, 0.08)",
    panelBorder: "#10b981",
    panelText: "#047857",
    buttonBg: "#059669",
  },
  info: {
    badgeBg: "rgba(217, 119, 6, 0.1)",
    badgeText: "#b45309",
    panelBg: "rgba(217, 119, 6, 0.05)",
    panelBorder: "rgba(217, 119, 6, 0.25)",
    panelText: "#c2410c",
    buttonBg: "#d97706",
  },
  warning: {
    badgeBg: "#fff7ed",
    badgeText: "#d97706",
    panelBg: "#fff7ed",
    panelBorder: "#fed7aa",
    panelText: "#b45309",
    buttonBg: "#d97706",
  },
  danger: {
    badgeBg: "rgba(239, 68, 68, 0.1)",
    badgeText: "#dc2626",
    panelBg: "rgba(239, 68, 68, 0.08)",
    panelBorder: "#fca5a5",
    panelText: "#b91c1c",
    buttonBg: "#dc2626",
  },
  neutral: {
    badgeBg: "#f3f4f6",
    badgeText: "#6b7280",
    panelBg: "#f8fafc",
    panelBorder: "#e5e7eb",
    panelText: "#475569",
    buttonBg: "#0f172a",
  },
};

export function buildGenericEmailBadge(args: {
  label: string;
  tone?: GenericEmailTone;
  secondaryLabel?: string;
}) {
  const tone = GENERIC_EMAIL_TONES[args.tone ?? "info"];

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 16px 0;">
      <tr>
        <td style="background-color:${tone.badgeBg};padding:4px 10px;border-radius:20px;">
          <span style="display:inline-block;font-size:11px;font-weight:600;color:${tone.badgeText};text-transform:uppercase;letter-spacing:0.5px;">
            ${escapeHtml(args.label)}
          </span>
        </td>
        ${
          args.secondaryLabel
            ? `<td style="padding-left:8px;">
                <span style="display:inline-block;background-color:#f3f4f6;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;color:#6b7280;">
                  ${escapeHtml(args.secondaryLabel)}
                </span>
              </td>`
            : ""
        }
      </tr>
    </table>
  `;
}

export function buildGenericEmailLead(args: {
  attendeeName: string;
  intro: string;
}) {
  return `
    <p style="margin:16px 0 4px 0;font-size:13px;color:#1a1a2e;line-height:1.5;">
      Hi <strong>${escapeHtml(args.attendeeName)}</strong>,
    </p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#6b7280;line-height:1.5;">
      ${args.intro}
    </p>
  `;
}

export function buildGenericEmailBanner(args: {
  title: string;
  description: string;
  tone?: GenericEmailTone;
}) {
  const tone = GENERIC_EMAIL_TONES[args.tone ?? "info"];

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${tone.panelBg};border-left:4px solid ${tone.panelBorder};border-radius:0 8px 8px 0;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:${tone.panelText};">
            ${escapeHtml(args.title)}
          </p>
          <p style="margin:0;font-size:13px;color:${tone.panelText};line-height:1.5;">
            ${args.description}
          </p>
        </td>
      </tr>
    </table>
  `;
}

type GenericDetailItem = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

function buildGenericDetailCard(item: GenericDetailItem, extraMarginBottom = false) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f8f9fa;border-radius:8px;${extraMarginBottom ? "margin-bottom:10px;" : ""}">
      <tr>
        <td style="padding:12px;">
          <p style="margin:0 0 6px 0;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(
            item.label,
          )}</p>
          <p style="margin:0;font-size:13px;font-weight:500;color:#1a1a2e;">${escapeHtml(
            item.value,
          )}</p>
        </td>
      </tr>
    </table>
  `;
}

export function buildGenericDetailsGrid(args: {
  items: GenericDetailItem[];
  stacked?: boolean;
}) {
  if (args.stacked) {
    const stackedRowsHtml = args.items
      .map(
        (item, index) => `
        <tr>
          <td colspan="2">
            ${buildGenericDetailCard(item, index < args.items.length - 1)}
          </td>
        </tr>
      `,
      )
      .join("");

    return `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
        ${stackedRowsHtml}
      </table>
    `;
  }

  const fullWidthItems = args.items.filter((item) => item.fullWidth);
  const halfWidthItems = args.items.filter((item) => !item.fullWidth);
  const halfWidthRows: GenericDetailItem[][] = [];

  for (let index = 0; index < halfWidthItems.length; index += 2) {
    halfWidthRows.push(halfWidthItems.slice(index, index + 2));
  }

  const halfWidthRowsHtml = halfWidthRows
    .map((row, rowIndex) => {
      const first = row[0];
      const second = row[1];
      const hasSecond = Boolean(second);
      const rowNeedsBottomPadding =
        rowIndex < halfWidthRows.length - 1 || fullWidthItems.length > 0;

      return `
        <tr>
          <td width="${hasSecond ? "50%" : "100%"}" style="padding-right:${hasSecond ? "5px" : "0"};padding-bottom:${rowNeedsBottomPadding ? "10px" : "0"};vertical-align:top;">
            ${buildGenericDetailCard(first)}
          </td>
          ${
            hasSecond
              ? `<td width="50%" style="padding-left:5px;padding-bottom:${rowNeedsBottomPadding ? "10px" : "0"};vertical-align:top;">
                  ${buildGenericDetailCard(second)}
                </td>`
              : ""
          }
        </tr>
      `;
    })
    .join("");

  const fullWidthHtml = fullWidthItems
    .map(
      (item, index) => `
        <tr>
          <td colspan="2">
            ${buildGenericDetailCard(item, index < fullWidthItems.length - 1)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
      ${halfWidthRowsHtml}
      ${fullWidthHtml}
    </table>
  `;
}

export function buildGenericKeyValueTable(args: {
  title: string;
  rows: Array<{
    label: string;
    value: string;
    highlighted?: boolean;
    emphasized?: boolean;
  }>;
}) {
  const rowsHtml = args.rows
    .map(
      (row, index) => `
        <tr>
          <td style="padding:12px 16px;font-size:12px;color:#6b7280;${
            row.highlighted ? "background-color:#fafafa;" : ""
          }${index < args.rows.length - 1 ? "border-bottom:1px solid #e5e7eb;" : ""}">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:12px 16px;font-size:13px;color:${row.emphasized ? "#0f172a" : "#1a1a2e"};font-weight:${row.emphasized ? "600" : "500"};${
            row.highlighted ? "background-color:#fafafa;" : ""
          }${index < args.rows.length - 1 ? "border-bottom:1px solid #e5e7eb;" : ""}">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#1a1a2e;">${escapeHtml(
      args.title,
    )}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${rowsHtml}
    </table>
  `;
}

export function buildGenericDataTable(args: {
  title: string;
  headers: string[];
  rows: string[][];
  rightAlignedColumnIndexes?: number[];
}) {
  const rightAligned = new Set(args.rightAlignedColumnIndexes ?? []);

  return `
    <p style="margin:0 0 12px 0;font-size:12px;font-weight:600;color:#1a1a2e;">${escapeHtml(
      args.title,
    )}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tr style="background-color:#f8f9fa;">
        ${args.headers
          .map(
            (header, index) => `<td style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;${
              rightAligned.has(index) ? "text-align:right;" : ""
            }">
              ${escapeHtml(header)}
            </td>`,
          )
          .join("")}
      </tr>
      ${args.rows
        .map(
          (row) => `
            <tr>
              ${row
                .map(
                  (cell, index) => `<td style="padding:12px;font-size:13px;color:#1a1a2e;${
                      rightAligned.has(index) ? "text-align:right;" : ""
                    }">
                      ${escapeHtml(cell)}
                    </td>`,
                )
                .join("")}
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

export function buildGenericInfoPanel(args: {
  title: string;
  description: string;
  tone?: GenericEmailTone;
  actionLabel?: string;
  actionUrl?: string;
  actionAsButton?: boolean;
  note?: string;
}) {
  const tone = GENERIC_EMAIL_TONES[args.tone ?? "info"];
  const hasAction = Boolean(args.actionLabel && args.actionUrl);
  let actionMarkup = "";

  if (hasAction && args.actionAsButton) {
    actionMarkup = `<p style="margin:0 0 14px 0;">
        <a href="${args.actionUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${tone.buttonBg};color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;line-height:1;padding:10px 14px;border-radius:6px;">${escapeHtml(
          args.actionLabel!,
        )}</a>
      </p>`;
  } else if (hasAction) {
    actionMarkup = `<a href="${args.actionUrl}" target="_blank" rel="noopener noreferrer" style="color:${tone.buttonBg};text-decoration:none;font-size:12px;font-weight:600;">${escapeHtml(
      args.actionLabel!,
    )}</a>`;
  }

  const noteMargin = actionMarkup ? "12px" : "0";

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${tone.panelBg};border:1px solid ${tone.panelBorder};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#1a1a2e;">${escapeHtml(
            args.title,
          )}</p>
          <p style="margin:0${actionMarkup || args.note ? " 0 12px 0" : ""};font-size:12px;color:#6b7280;line-height:1.5;">${escapeHtml(
            args.description,
          )}</p>
          ${actionMarkup}
          ${
            args.note
              ? `<p style="margin:${noteMargin} 0 0 0;font-size:11px;color:#6b7280;line-height:1.5;">${escapeHtml(
                  args.note,
                )}</p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

export function buildGenericCodeCard(args: {
  title: string;
  code: string;
  tone?: GenericEmailTone;
  note?: string;
}) {
  const tone = GENERIC_EMAIL_TONES[args.tone ?? "info"];

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${tone.panelBg};border:1px solid ${tone.panelBorder};border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1a1a2e;">${escapeHtml(
            args.title,
          )}</p>
          <div style="display:inline-block;padding:12px 16px;border-radius:8px;background:#ffffff;border:1px solid #e5e7eb;font-size:24px;line-height:1;font-weight:700;letter-spacing:0.18em;color:#0f172a;">
            ${escapeHtml(args.code)}
          </div>
          ${
            args.note
              ? `<p style="margin:12px 0 0 0;font-size:11px;line-height:1.5;color:#6b7280;">${escapeHtml(
                  args.note,
                )}</p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}
