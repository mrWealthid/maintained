import "server-only";

import { NextRequest, NextResponse } from "next/server";
import jwt, { SignOptions } from "jsonwebtoken";

import { createAuthSession } from "@/lib/auth/session";
import {
  isPlatformSuperAdminRole,
  PLATFORM_ROLE,
  resolveWorkspaceRole,
  toLegacySessionRole,
} from "@/shared/auth/roles";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import type { UserDoc } from "@/models/userModel";

type AuthSessionIssueArgs = {
  request: NextRequest;
  user: UserDoc;
  status?: number;
  body?: Record<string, unknown>;
  maxActiveSessions?: number | "unlimited";
};

function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function getCookieExpiresAt() {
  const minutes = Number(process.env.JWT_COOKIE_EXPIRES_IN);
  const fallbackMinutes = 7 * 24 * 60;
  return new Date(Date.now() + (Number.isFinite(minutes) ? minutes : fallbackMinutes) * 60 * 1000);
}

function getSessionContext(user: UserDoc) {
  const businessId = user.currentBusiness?.toString();
  const membership = user.memberships.find(
    (item) => item.business.toString() === businessId
  );

  if (!businessId || !membership || membership.status !== INVITE_STATUS.activated) {
    return null;
  }

  const platformRole = isPlatformSuperAdminRole(membership.role)
    ? PLATFORM_ROLE.super_admin
    : null;
  const workspaceRole = platformRole
    ? null
    : resolveWorkspaceRole({
        storedRole: membership.role,
        isWorkspaceOwner: membership.isCreator,
      });
  const role = platformRole
    ? ROLES.super_admin
    : toLegacySessionRole(workspaceRole ?? membership.role) ?? membership.role;

  return {
    businessId,
    role,
    platformRole,
    workspaceRole,
  };
}

async function issueAuthSession(args: AuthSessionIssueArgs) {
  const sessionContext = getSessionContext(args.user);
  if (!sessionContext) {
    throw new Error("User does not have an active workspace membership");
  }

  const session = await createAuthSession({
    userId: args.user.id,
    businessId: sessionContext.businessId,
    role: sessionContext.role,
    workspaceRole: sessionContext.workspaceRole,
    maxActiveSessions: args.maxActiveSessions,
    ipAddress: getRequestIp(args.request),
    userAgent: args.request.headers.get("user-agent") ?? "",
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

  response.cookies.set("token", issuedAuthSession.token, {
    httpOnly: true,
    expires: issuedAuthSession.expiresAt,
  });

  return response;
}
