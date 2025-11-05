// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { INVITE_STATUS, ROLES } from "./shared/enums/enums";

type Role = "ADMIN" | "TECHNICIAN" | "USER" | string | null;
type TenantsClaim = Array<{
  business: string;
  role: ROLES;
  status: INVITE_STATUS;
}>;
type DecodedToken = JwtPayload & {
  role?: string; // optional legacy single-tenant role
  tenants?: TenantsClaim; // multi-tenant roles
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const path = url.pathname;

  const token = request.cookies.get("token")?.value || null;
  const { valid, decoded } = decodeToken(token);

  const role: Role = getEffectiveRole(request, decoded);

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

  // If token exists and user tries to visit auth pages (except onboard-user), reroute to their dashboard
  if (token && valid && isAuthRoute) {
    return NextResponse.redirect(getDashboardURL(request, role));
  }

  // Protect all dashboard routes
  if (isAnyDashboard) {
    // No/invalid token → send to login
    if (!token || !valid) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Token present: normalize dashboard by role
    // --- inside your middleware, inside the "isAnyDashboard" guard ---
    const targetPrefix = getDashboardPath(role);
    const currentPrefix = matchDashPrefix(path);

    // No/invalid token handled earlier. If prefixes differ, preserve the trailing subpath.
    if (currentPrefix && currentPrefix !== targetPrefix) {
      const suffix = path.slice(currentPrefix.length); // "" or like "/tickets/123?tab=quote"
      const redirectUrl = new URL(request.url); // preserves search/hash
      redirectUrl.pathname = targetPrefix + suffix; // e.g. "/admin/dashboard" + "/tickets/123"
      return NextResponse.redirect(redirectUrl);
    }

    // Otherwise allow
    return NextResponse.next();
  }

  // All other /auth routes (like onboard-user) pass through

  return NextResponse.next();
}

/**
 * Determine the user's effective role for the active business.
 * Priority:
 *  1) If a biz cookie is present, match tenants[].businessId and use that role.
 *  2) Fallback to decoded.role (legacy single-tenant).
 *  3) Fallback to 'USER'.
 */
function getEffectiveRole(
  req: NextRequest,
  decoded: DecodedToken | null
): Role {
  if (!decoded) return null;

  // read active business from cookie set by your "switch business" action
  const activeBizId = req.cookies.get("activeBusiness")?.value || null;

  if (activeBizId && Array.isArray(decoded.tenants)) {
    const match = decoded.tenants.find(
      (t) => String(t.business) === String(activeBizId)
    );
    if (match?.role) return match.role.toUpperCase();
  }

  if (decoded.role) return decoded.role.toUpperCase();
  return "USER";
}

// /** Map role → dashboard path */
// function getDashboardPath(
// 	role: Role
// ): '/admin/dashboard' | '/technician/dashboard' | '/dashboard' {
// 	const r = (role || '').toUpperCase();
// 	if (r.includes('SUPERADMIN') || r.includes('ADMIN'))
// 		return '/admin/dashboard';
// 	if (r.includes('TECHNICIAN')) return '/technician/dashboard';
// 	return '/dashboard';
// }

// Map role → dashboard prefix (unchanged)
function getDashboardPath(
  role: Role
): "/admin/dashboard" | "/technician/dashboard" | "/dashboard" {
  const r = (role || "").toUpperCase();
  if (r.includes("ADMIN")) return "/admin/dashboard";
  if (r.includes("TECHNICIAN")) return "/technician/dashboard";
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
    const decoded = jwt.decode(token) as DecodedToken | null;
    if (!decoded?.exp) return { valid: false, decoded: null };
    const notExpired = Date.now() < decoded.exp * 1000;
    return { valid: notExpired, decoded: notExpired ? decoded : null };
  } catch {
    return { valid: false, decoded: null };
  }
}

// Only run where needed
export const config = {
  matcher: [
    "/", // homepage (unprotected)
    "/auth/:path*", // login/register + onboard-user
    "/dashboard/:path*", // user dashboard (protected)
    "/admin/dashboard/:path*", // admin dashboard (protected)
    "/technician/dashboard/:path*", // technician dashboard (protected)
  ],
};
