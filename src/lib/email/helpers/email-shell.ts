import {
  asHtmlWithLinks,
  EMAIL_MUTED_TEXT_COLOR,
  EMAIL_TEXT_COLOR,
  escapeHtml,
} from "@/lib/email/helpers/email-html";
import { resolveEmailLogoSrc } from "@/lib/email/helpers/email-branding";

export function buildStandardEmailBody(args: {
  preheader?: string;
  bodyText: string;
  extraHtml?: string;
  footer?: string;
}) {
  return `
    ${args.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(args.preheader)}</div>` : ""}
    ${asHtmlWithLinks(args.bodyText)}
    ${args.extraHtml ?? ""}
    ${
      args.footer
        ? `<p style="margin:24px 0 0 0;font-size:12px;line-height:1.6;color:${EMAIL_MUTED_TEXT_COLOR};">${escapeHtml(args.footer)}</p>`
        : ""
    }
  `;
}

export function wrapWithBrandedEmailShell(args: {
  appName: string;
  senderName: string;
  contentHtml: string;
  /** Absolute logo URL. Defaults to the hosted Properly mark. Pass "" to hide. */
  appLogoSrc?: string;
}) {
  const logoSrc = args.appLogoSrc ?? resolveEmailLogoSrc();
  const logoCell = logoSrc
    ? `<td style="padding:0 12px 0 0;vertical-align:middle;">
                        <img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(args.appName)} logo" width="40" height="40" style="width:40px;height:40px;display:block;border:0;outline:none;text-decoration:none;border-radius:9px;" />
                      </td>`
    : "";

  const brandName = args.senderName || args.appName;
  const showSubtitle = args.senderName.trim() !== "" && args.senderName !== args.appName;

  return `<!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:${EMAIL_TEXT_COLOR};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;border-bottom:1px solid #e2e8f0;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                    <tr>
                      ${logoCell}
                      <td style="vertical-align:middle;">
                        <div style="font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(brandName)}</div>
                        ${
                          showSubtitle
                            ? `<div style="margin-top:4px;font-size:12px;color:${EMAIL_MUTED_TEXT_COLOR};">${escapeHtml(args.appName)}</div>`
                            : ""
                        }
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  ${args.contentHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
