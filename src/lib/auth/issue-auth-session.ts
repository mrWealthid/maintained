import "server-only";

import { NextRequest, NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";

import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookie";
import { createAuthSession } from "@/lib/auth/session";
import { getRequestSecurityContext } from "@/lib/security/request-context";
import {
  isPlatformSuperAdminRole,
  PLATFORM_ROLE,
  resolveWorkspaceRole,
  toLegacySessionRole,
} from "@/shared/auth/roles";
import { ROLES } from "@/shared/enums/enums";
import type { UserDoc } from "@/models/userModel";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";

type AuthSessionIssueArgs = {
  request: NextRequest;
  user: UserDoc;
  status?: number;
  body?: Record<string, unknown>;
  maxActiveSessions?: number | "unlimited";
};

function getCookieExpiresAt() {
  const minutes = Number(process.env.JWT_COOKIE_EXPIRES_IN);
  const fallbackMinutes = 7 * 24 * 60;
  return new Date(Date.now() + (Number.isFinite(minutes) ? minutes : fallbackMinutes) * 60 * 1000);
}

async function getSessionContext(user: UserDoc) {
  const businessId = user.currentBusiness?.toString();

  if (!businessId) {
    return null;
  }

  const membership = await findActiveWorkspaceMembership({
    userId: user.id,
    workspaceId: businessId,
  }).lean<{
    role?: string | null;
    roleDefinition?: unknown;
  } | null>();

  if (!membership?.role) {
    return null;
  }

  const platformRole = isPlatformSuperAdminRole(membership.role)
    ? PLATFORM_ROLE.super_admin
    : null;
  const workspaceRole = platformRole
    ? null
    : resolveWorkspaceRole({
        storedRole: membership.role,
      });
  const role = platformRole
    ? ROLES.super_admin
    : toLegacySessionRole(workspaceRole ?? membership.role) ?? membership.role;

  return {
    businessId,
    role: role as ROLES,
    platformRole,
    workspaceRole,
  };
}

async function issueAuthSession(args: AuthSessionIssueArgs) {
  const sessionContext = await getSessionContext(args.user);
  if (!sessionContext) {
    throw new Error("User does not have an active workspace membership");
  }

  const requestContext = await getRequestSecurityContext(args.request);
  const session = await createAuthSession({
    userId: args.user.id,
    businessId: sessionContext.businessId,
    role: sessionContext.role,
    workspaceRole: sessionContext.workspaceRole,
    maxActiveSessions: args.maxActiveSessions,
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  });

  const token = jwt.sign(
    {
      id: args.user.id,
      currentBusiness: sessionContext.businessId,
      businessId: sessionContext.businessId,
      role: sessionContext.role,
      platformRole: sessionContext.platformRole,
      workspaceRole: sessionContext.workspaceRole,
      sessionId: session.sessionId,
      tenants: args.user.tenantsClaim(),
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN } as SignOptions
  );

  return {
    token,
    expiresAt: getCookieExpiresAt(),
  };
}

export async function buildAuthSuccessResponse(
  args: AuthSessionIssueArgs
) {
  const issuedAuthSession = await issueAuthSession(args);
  const response = NextResponse.json(
    args.body ?? { status: "success", token: issuedAuthSession.token },
    { status: args.status ?? 200 }
  );

  response.cookies.set(
    AUTH_COOKIE_NAME,
    issuedAuthSession.token,
    getAuthCookieOptions(issuedAuthSession.expiresAt)
  );

  return response;
}

export async function buildAuthRedirectResponse(
  args: Omit<AuthSessionIssueArgs, "body" | "status"> & { redirectTo: string }
) {
  const issuedAuthSession = await issueAuthSession(args);
  const redirectUrl = new URL(args.redirectTo, args.request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(
    AUTH_COOKIE_NAME,
    issuedAuthSession.token,
    getAuthCookieOptions(issuedAuthSession.expiresAt)
  );

  return response;
}
