import { resolveAppOriginFromEnv } from "@/lib/email/helpers/app-url";
import { escapeHtml } from "@/lib/email/helpers/email-html";
import {
  EMAIL_FONT_STACK,
  EMAIL_TEXT_COLOR,
} from "@/lib/email/helpers/email-theme";

export const DEFAULT_EMAIL_APP_NAME = "Properly";

// Override with a fully-qualified URL; otherwise the bundled Properly mark is used.
const CONFIGURED_EMAIL_APP_ICON_URL =
  process.env.NEXT_PUBLIC_APP_ICON_URL?.trim() || "";
const DEFAULT_EMAIL_LOGO_PATH = "/brand/email-logo.png";

function isEmailSafeImage(src: string) {
  const normalized = src.trim().toLowerCase();
  return (
    normalized.startsWith("https://") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("/")
  );
}

/**
 * Resolve the brand logo for emails as an ABSOLUTE url. Email clients can't
 * load relative paths or render inline SVG, so we serve a hosted PNG of the
 * Properly mark and prefix relative paths with the app origin. Returns "" when
 * no origin is configured and the source is relative (logo is then omitted).
 */
export function resolveEmailLogoSrc() {
  const candidate = CONFIGURED_EMAIL_APP_ICON_URL || DEFAULT_EMAIL_LOGO_PATH;

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  const origin = resolveAppOriginFromEnv();
  return origin ? `${origin}${candidate}` : "";
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
