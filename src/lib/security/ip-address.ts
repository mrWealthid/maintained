const IPV4_SEGMENT_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6_REGEX =
  /^((?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}|(?:[A-F0-9]{1,4}:){1,7}:|(?:[A-F0-9]{1,4}:){1,6}:[A-F0-9]{1,4}|(?:[A-F0-9]{1,4}:){1,5}(?::[A-F0-9]{1,4}){1,2}|(?:[A-F0-9]{1,4}:){1,4}(?::[A-F0-9]{1,4}){1,3}|(?:[A-F0-9]{1,4}:){1,3}(?::[A-F0-9]{1,4}){1,4}|(?:[A-F0-9]{1,4}:){1,2}(?::[A-F0-9]{1,4}){1,5}|[A-F0-9]{1,4}:(?::[A-F0-9]{1,4}){1,6}|:(?::[A-F0-9]{1,4}){1,7}|::)$/i;

function isValidIpv4(value: string) {
  const segments = value.split(".");
  return segments.length === 4 && segments.every((segment) => IPV4_SEGMENT_REGEX.test(segment));
}

function isLikelyIpv4WithPort(value: string) {
  const parts = value.split(":");
  return (
    parts.length === 2 &&
    /^\d+$/.test(parts[1] ?? "") &&
    isValidIpv4(parts[0] ?? "")
  );
}

export function normalizeIpAddress(value?: string | null) {
  if (!value) return "";

  let candidate = value.split(",")[0]?.trim() ?? "";
  if (!candidate) return "";

  if (candidate.startsWith("[") && candidate.endsWith("]")) {
    candidate = candidate.slice(1, -1);
  }

  if (isLikelyIpv4WithPort(candidate)) {
    candidate = candidate.split(":")[0] ?? candidate;
  }

  const lowerCandidate = candidate.toLowerCase();
  if (lowerCandidate.startsWith("::ffff:")) {
    const mappedIpv4 = lowerCandidate.slice("::ffff:".length);
    if (isValidIpv4(mappedIpv4)) {
      return mappedIpv4;
    }
  }

  return lowerCandidate;
}

export function isValidIpAddress(value?: string | null) {
  const candidate = normalizeIpAddress(value);
  return Boolean(candidate) && (isValidIpv4(candidate) || IPV6_REGEX.test(candidate));
}

export function normalizeIpAddressList(values?: Array<string | null | undefined>) {
  const normalizedIps: string[] = [];
  const seen = new Set<string>();

  for (const value of values ?? []) {
    const normalized = normalizeIpAddress(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    normalizedIps.push(normalized);
  }

  return normalizedIps;
}

export function getInvalidIpAddresses(values?: Array<string | null | undefined>) {
  return normalizeIpAddressList(values).filter((value) => !isValidIpAddress(value));
}

export function splitIpAddressInput(value: string) {
  return value
    .split(/[\n,]+/)
    .map((entry) => normalizeIpAddress(entry))
    .filter(Boolean);
}
