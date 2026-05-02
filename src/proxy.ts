import { NextResponse, NextRequest } from "next/server";
import { ROLES } from "./shared/enums/enums";

type Role = "ADMIN" | "TECHNICIAN" | "USER" | string | null;
type DecodedToken = {
  exp?: number;
  role?: ROLES | string;
  businessId?: string;
  currentBusiness?: string;
  sessionId?: string;
};

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  const token = request.cookies.get("token")?.value || null;
  const { valid, decoded } = decodeToken(token);

  const role: Role = decoded?.role?.toUpperCase() ?? null;

  // --- Route groups ---
  const isHome = path === "/";
  const isAuthBase = path.startsWith("/auth");
  const isOnboarding = path.startsWith("/auth/onboard-user");

  const isAuthRoute = isAuthBase && !isOnboarding; // login/register/etc. but NOT onboard-user
  const isUserDash = path.startsWith("/dashboard");
  const isTechDash = path.startsWith("/technician/dashboard");
  const isAdminDash = path.startsWith("/admin/dashboard");
  const isAnyDashboard = isUserDash || isAdminDash || isTechDash;

  // Home page should not be protected
  if (isHome) {
    return NextResponse.next();
  }

  // Proxy only performs fast session-token routing. Server layouts call
  // requireDashboardAccess for the authoritative DB-backed guard.
  if (token && valid && isAuthRoute) {
    return NextResponse.redirect(getDashboardURL(request, role));
  }

  // Protect all dashboard routes
  if (isAnyDashboard) {
    // No/invalid token → send to login
    if (!token || !valid) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const targetPrefix = getDashboardPath(role);
    const currentPrefix = matchDashPrefix(path);

    if (currentPrefix && currentPrefix !== targetPrefix) {
      const suffix = path.slice(currentPrefix.length);
      const redirectUrl = new URL(request.url);
      redirectUrl.pathname = targetPrefix + suffix;
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  }

  // All other /auth routes (like onboard-user) pass through

  return NextResponse.next();
}

function getDashboardPath(
  role: Role
): "/dashboard" {
  void role;
  return "/dashboard";
}

// Helper: find which dashboard prefix the current path is under
function matchDashPrefix(
  path: string
): "/admin/dashboard" | "/technician/dashboard" | "/dashboard" | null {
  const prefixes = [
    "/admin/dashboard",
    "/technician/dashboard",
    "/dashboard",
  ] as const;
  for (const p of prefixes) {
    if (path === p || path.startsWith(p + "/")) return p;
  }
  return null;
}

function getDashboardURL(req: NextRequest, role: Role) {
  return new URL(getDashboardPath(role), req.url);
}

function decodeToken(token: string | null): {
  valid: boolean;
  decoded: DecodedToken | null;
} {
  if (!token) {
    return { valid: false, decoded: null };
  }
  try {
    const decoded = decodeJwtPayload(token);
    if (!decoded?.exp || !decoded.sessionId || !decoded.role) {
      return { valid: false, decoded: null };
    }
    const notExpired = Date.now() < decoded.exp * 1000;
    return { valid: notExpired, decoded: notExpired ? decoded : null };
  } catch {
    return { valid: false, decoded: null };
  }
}

function decodeJwtPayload(token: string): DecodedToken | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "="
  );

  return JSON.parse(atob(paddedPayload)) as DecodedToken;
}

// Only run where needed
export const config = {
  matcher: [
    "/", // homepage (unprotected)
    "/auth/:path*", // login/register + onboard-user
    "/dashboard/:path*", // user dashboard (protected)
    "/admin/dashboard/:path*", // legacy dashboard prefix, normalized
    "/technician/dashboard/:path*", // legacy dashboard prefix, normalized
  ],
};
