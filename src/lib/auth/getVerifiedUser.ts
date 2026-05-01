// utils/auth/getUserFromCookies.ts
import "server-only";

import { cookies as getCookiesHeader } from "next/headers";
import { NextRequest } from "next/server";

import { connect } from "@/dbConfig/dbConfig";
import {
  getActiveAuthSession,
  revokeAuthSession,
  touchAuthSession,
} from "@/lib/auth/session";
import { verifyToken } from "./token";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import {
  isPlatformSuperAdminRole,
  PLATFORM_ROLE,
  resolveWorkspaceRole,
  toLegacySessionRole,
  type WORKSPACE_ROLE,
} from "@/shared/auth/roles";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";

export type VerifiedUser = {
  id: string;
  currentBusiness: string;
  businessId: string;
  role: ROLES;
  platformRole: PLATFORM_ROLE | null;
  workspaceRole: WORKSPACE_ROLE | null;
  sessionId: string;
};

export const VERIFIED_USER_STATE_STATUS = {
  AUTHORIZED: "authorized",
  INACTIVE_BUSINESS: "inactive_business",
  UNAUTHENTICATED: "unauthenticated",
} as const;

export type VerifiedUserState =
  | {
      status: typeof VERIFIED_USER_STATE_STATUS.AUTHORIZED;
      user: VerifiedUser;
    }
  | { status: typeof VERIFIED_USER_STATE_STATUS.INACTIVE_BUSINESS }
  | { status: typeof VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };

async function readAuthToken(request?: NextRequest) {
  if (request) {
    return request.cookies.get("token")?.value;
  }

  const cookieStore = await getCookiesHeader();
  return cookieStore.get("token")?.value;
}

export async function getVerifiedUserState(
  request?: NextRequest
): Promise<VerifiedUserState> {
  const token = await readAuthToken(request);

  if (!token) {
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  const payload = verifyToken(token);
  if (!payload || (payload.exp && Date.now() > payload.exp * 1000)) {
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  if (!payload.currentBusiness || !payload.role || !payload.sessionId) {
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  await connect();

  const [session, user, business] = await Promise.all([
    getActiveAuthSession({
      sessionId: payload.sessionId,
      userId: payload.id,
    }).lean<{
      sessionId: string;
      businessId: string;
      role: ROLES;
      workspaceRole?: WORKSPACE_ROLE | null;
      lastSeenAt?: Date;
    } | null>(),
    User.findById(payload.id).select("memberships currentBusiness").lean<{
      memberships: Array<{
        business: { toString(): string };
        role: ROLES;
        status: INVITE_STATUS;
        isCreator?: boolean;
      }>;
      currentBusiness: { toString(): string };
    } | null>(),
    Business.findById(payload.currentBusiness)
      .select("active")
      .lean<{ active?: boolean } | null>(),
  ]);

  if (!session || !user) {
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  if (!business || business.active === false) {
    return { status: VERIFIED_USER_STATE_STATUS.INACTIVE_BUSINESS };
  }

  if (
    session.businessId !== payload.currentBusiness ||
    session.role !== payload.role ||
    (session.workspaceRole ?? null) !== (payload.workspaceRole ?? null)
  ) {
    await revokeAuthSession(payload.sessionId);
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  const currentMembership = user.memberships.find(
    (membership) =>
      membership.business.toString() === payload.currentBusiness &&
      membership.status === INVITE_STATUS.activated
  );

  if (!currentMembership) {
    await revokeAuthSession(payload.sessionId);
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  const platformRole = isPlatformSuperAdminRole(currentMembership.role)
    ? PLATFORM_ROLE.super_admin
    : null;
  const workspaceRole = platformRole
    ? null
    : resolveWorkspaceRole({
        storedRole: currentMembership.role,
        isWorkspaceOwner: currentMembership.isCreator,
      });
  const role = platformRole
    ? ROLES.super_admin
    : toLegacySessionRole(workspaceRole ?? currentMembership.role) ??
      currentMembership.role;

  if (
    role !== payload.role ||
    (workspaceRole ?? null) !== (payload.workspaceRole ?? null)
  ) {
    await revokeAuthSession(payload.sessionId);
    return { status: VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED };
  }

  await touchAuthSession(payload.sessionId);

  return {
    status: VERIFIED_USER_STATE_STATUS.AUTHORIZED,
    user: {
      id: payload.id,
      currentBusiness: payload.currentBusiness,
      businessId: payload.currentBusiness,
      role,
      platformRole,
      workspaceRole,
      sessionId: payload.sessionId,
    },
  };
}

export async function getVerifiedUser(
  request?: NextRequest
): Promise<VerifiedUser | null> {
  const result = await getVerifiedUserState(request);
  return result.status === VERIFIED_USER_STATE_STATUS.AUTHORIZED
    ? result.user
    : null;
}
