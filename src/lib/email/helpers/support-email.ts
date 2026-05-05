export const LEGACY_PLATFORM_SUPPORT_EMAIL = "support@wealthtech.website";
export const LEGACY_PLATFORM_SUPPORT_EMAILS = [
  "support@wealthtech.website",
  "support@maintainly.app",
] as const;
export const SUPPORT_EMAIL_TEMPLATE_TOKEN = "{{support_email}}";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isLegacyPlatformSupportEmail(value?: string | null) {
  return LEGACY_PLATFORM_SUPPORT_EMAILS.includes(
    (value?.trim().toLowerCase() || "") as
      (typeof LEGACY_PLATFORM_SUPPORT_EMAILS)[number],
  );
}

export function stripLegacyPlatformSupportEmail(value?: string | null) {
  const trimmed = value?.trim() || "";
  return isLegacyPlatformSupportEmail(trimmed) ? "" : trimmed;
}

export function normalizeSupportEmailFooterTemplate(
  footer?: string | null,
  fallbackFooter?: string | null,
) {
  const source = footer?.trim() || fallbackFooter?.trim() || "";
  if (!source) return "";
  if (/\{\{\s*support_email\s*\}\}/i.test(source)) return source;

  return LEGACY_PLATFORM_SUPPORT_EMAILS.reduce(
    (nextSource, email) =>
      nextSource.replace(
        new RegExp(escapeRegExp(email), "gi"),
        SUPPORT_EMAIL_TEMPLATE_TOKEN,
      ),
    source,
  );
}
