import type { NextRequest } from "next/server";

/** App origin from environment only (no request) — for use when sending email. */
export function resolveAppOriginFromEnv() {
  return (
    process.env.PRODUCTION_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    process.env.DEVELOPMENT_URL?.trim().replace(/\/$/, "") ||
    ""
  );
}

export function resolveAppBaseUrl(request: NextRequest) {
  return resolveAppOriginFromEnv() || request.nextUrl.origin.replace(/\/$/, "");
}
