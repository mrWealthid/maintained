export const DEFAULT_TIME_ZONE = "America/New_York";

function listSupportedTimeZones() {
  if (
    typeof Intl !== "undefined" &&
    "supportedValuesOf" in Intl &&
    typeof Intl.supportedValuesOf === "function"
  ) {
    const zones = Intl.supportedValuesOf("timeZone");
    if (Array.isArray(zones) && zones.length > 0) {
      return zones;
    }
  }

  return [DEFAULT_TIME_ZONE];
}

export const TIME_ZONE_OPTIONS = listSupportedTimeZones().map((timeZone) => ({
  value: timeZone,
  label: timeZone.replace(/_/g, " "),
}));

const TIME_ZONE_SET = new Set(TIME_ZONE_OPTIONS.map((option) => option.value));

export function isSupportedTimeZone(value: unknown): value is string {
  return typeof value === "string" && TIME_ZONE_SET.has(value);
}

export function normalizeTimeZone(value: unknown) {
  return isSupportedTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

export function detectBrowserTimeZone() {
  if (typeof Intl === "undefined" || typeof Intl.DateTimeFormat !== "function") {
    return DEFAULT_TIME_ZONE;
  }

  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeTimeZone(detected);
}
