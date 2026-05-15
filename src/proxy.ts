import { NextResponse, NextRequest } from "next/server";
import { ROLES } from "./shared/enums/enums";
import {
  AUTH_COOKIE_NAME,
  LEGACY_AUTH_COOKIE_NAMES,
  getClearedAuthCookieOptions,
} from "@/lib/auth/cookie";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";

type Role = "ADMIN" | "TECHNICIAN" | "USER" | string | null;
type DecodedToken = {
  exp?: number;
  role?: ROLES | string;
  businessId?: string;
  currentBusiness?: string;
  sessionId?: string;
};

function isPublicAuthPath(pathname: string) {
  return (
    pathname.startsWith(APP_ROUTE_PATHS.AUTH.ONBOARD_USER_PREFIX) ||
    pathname === APP_ROUTE_PATHS.AUTH.RESET_PASSWORD ||
    pathname.startsWith(APP_ROUTE_PATHS.AUTH.UPDATE_PASSWORD_PREFIX) ||
    pathname.startsWith(APP_ROUTE_PATHS.AUTH.PASSWORDLESS_LINK_REVOKED) ||
    pathname.startsWith(APP_ROUTE_PATHS.AUTH.PASSWORDLESS_REVOKE) ||
    pathname.startsWith(APP_ROUTE_PATHS.AUTH.PASSWORDLESS_VERIFY) ||
    pathname === APP_ROUTE_PATHS.AUTH.SESSION_EXPIRED
  );
}

function buildProtectedAuthRedirect(args: {
  request: NextRequest;
  nextPath: string;
  hasCookie: boolean;
}) {
  const { request, nextPath, hasCookie } = args;

  // No cookie → straight to login with the preserved return path.
  if (!hasCookie) {
    return NextResponse.redirect(
      new URL(
        `${APP_ROUTE_PATHS.AUTH.LOGIN}?next=${encodeURIComponent(nextPath)}`,
        request.url
      )
    );
  }

  // Cookie still present but the edge no longer considers it valid.
  // Route through session-expired so the stale cookie is cleared first.
  return NextResponse.redirect(
    new URL(
      `${APP_ROUTE_PATHS.AUTH.SESSION_EXPIRED}?next=${encodeURIComponent(nextPath)}`,
      request.url
    )
  );
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;
  const fullTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
  const { valid, decoded } = decodeToken(token);

  const role: Role = decoded?.role?.toUpperCase() ?? null;

  const isHome = path === "/";
  const isAuthBase = path.startsWith("/auth");
  const isPublicAuth = isPublicAuthPath(path);
  const isAuthLanding = isAuthBase && !isPublicAuth;

  const isUserDash = path.startsWith("/dashboard");
  const isTechDash = path.startsWith("/technician/dashboard");
  const isAdminDash = path.startsWith("/admin/dashboard");
  const isAnyDashboard = isUserDash || isAdminDash || isTechDash;

  if (isHome) {
    return NextResponse.next();
  }

  // Authed user hitting an auth landing screen → bounce to next or dashboard.
  if (token && valid && isAuthLanding) {
    const next = request.nextUrl.searchParams.get("next");
    if (next && next.startsWith("/")) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(getDashboardURL(request, role));
  }

  // Protected dashboards.
  if (isAnyDashboard) {
    if (!valid) {
      return buildProtectedAuthRedirect({
        request,
        nextPath: fullTarget,
        hasCookie: Boolean(token),
      });
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

  // On an auth screen with a stale cookie → clear it in-place so auth pages
  // don't keep seeing a dead token.
  if (isAuthBase && !valid && token) {
    const res = NextResponse.next();
    for (const cookieName of [AUTH_COOKIE_NAME, ...LEGACY_AUTH_COOKIE_NAMES]) {
      res.cookies.set(cookieName, "", getClearedAuthCookieOptions());
    }
    return res;
  }

  return NextResponse.next();
}

function getDashboardPath(role: Role): "/dashboard" {
  void role;
  return "/dashboard";
}

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

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/dashboard/:path*",
    "/admin/dashboard/:path*",
    "/technician/dashboard/:path*",
  ],
};
