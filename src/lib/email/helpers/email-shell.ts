import {
  asHtmlWithLinks,
  EMAIL_MUTED_TEXT_COLOR,
  EMAIL_TEXT_COLOR,
  escapeHtml,
} from "@/lib/email/helpers/email-html";

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
}) {
  return `<!doctype html>
  <html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:${EMAIL_TEXT_COLOR};">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:24px 28px;border-bottom:1px solid #e2e8f0;">
                  <div style="font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(args.senderName || args.appName)}</div>
                  <div style="margin-top:4px;font-size:12px;color:${EMAIL_MUTED_TEXT_COLOR};">${escapeHtml(args.appName)}</div>
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
