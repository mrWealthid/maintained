import type { NextRequest } from "next/server";

export function resolveAppBaseUrl(request: NextRequest) {
  return (
    process.env.PRODUCTION_URL?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    process.env.DEVELOPMENT_URL?.trim().replace(/\/$/, "") ||
    request.nextUrl.origin.replace(/\/$/, "")
  );
}
