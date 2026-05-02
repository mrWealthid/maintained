import "server-only";

import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { normalizeIpAddress } from "@/lib/security/ip-address";

function getHeaderValue(
  request: NextRequest | undefined,
  key: string,
  fallbackHeaders?: Headers,
) {
  if (request) {
    return request.headers.get(key);
  }
  return fallbackHeaders?.get(key) ?? null;
}

function normalizeForwardedIp(value?: string | null) {
  const candidate = normalizeIpAddress(value);
  return candidate || null;
}

export async function getRequestSecurityContext(request?: NextRequest) {
  const fallbackHeaders = request ? undefined : await headers();
  const forwardedFor = getHeaderValue(request, "x-forwarded-for", fallbackHeaders);
  const realIp = getHeaderValue(request, "x-real-ip", fallbackHeaders);
  const userAgent = getHeaderValue(request, "user-agent", fallbackHeaders) ?? "";

  return {
    ipAddress: normalizeForwardedIp(forwardedFor) ?? normalizeForwardedIp(realIp),
    userAgent,
  };
}
