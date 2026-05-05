import { escapeHtml } from "@/lib/email/helpers/email-html";
import {
  EMAIL_FONT_STACK,
  EMAIL_TEXT_COLOR,
} from "@/lib/email/helpers/email-theme";

export const DEFAULT_EMAIL_APP_NAME = "Maintainly";

const DEFAULT_EMAIL_APP_ICON_URL =
  process.env.NEXT_PUBLIC_APP_ICON_URL?.trim() || "";

function isEmailSafeImage(src: string) {
  const normalized = src.trim().toLowerCase();
  return (
    normalized.startsWith("https://") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("/")
  );
}

export function resolveEmailLogoSrc() {
  return DEFAULT_EMAIL_APP_ICON_URL;
}

export function buildEmailBrandHeader(args: {
  appName: string;
  appLogoSrc?: string;
}) {
  const resolvedLogoSrc =
    args.appLogoSrc && isEmailSafeImage(args.appLogoSrc) ? args.appLogoSrc : "";

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;border-collapse:collapse;">
      <tr>
        <td style="text-align:left;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;border-collapse:collapse;">
            <tr>
              ${
                resolvedLogoSrc
                  ? `
                    <td style="padding:0 10px 0 0;vertical-align:middle;">
                      <img
                        class="email-brand-image"
                        src="${escapeHtml(resolvedLogoSrc)}"
                        alt="${escapeHtml(args.appName)} icon"
                        width="32"
                        height="32"
                        style="width:32px;height:32px;display:block;border:0;outline:none;text-decoration:none;border-radius:8px;"
                      />
                    </td>
                  `
                  : ""
              }
              <td style="vertical-align:middle;">
                <div class="email-brand-text" style="font-family:${EMAIL_FONT_STACK};font-size:13px;line-height:1.2;font-weight:600;letter-spacing:-0.01em;color:${EMAIL_TEXT_COLOR};">
                  ${escapeHtml(args.appName)}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
