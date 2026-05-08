// lib/auth/getVerifiedUser.ts
import { NextRequest } from "next/server";
import { verifyToken } from "./token";
import { cookies as getCookiesHeader } from "next/headers";
import User from "@/models/userModel";
import type { MembershipRoleValue } from "@/models/userModel";
import { ROLES } from "@/shared/enums/enums";
import Business from "@/models/businessModel";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";
import { connect } from "@/dbConfig/dbConfig";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";

export async function getUserFromCookies(
  request?: NextRequest,
  requiredRoles?: MembershipRoleValue[]
) {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  } else {
    const cookieStore = await getCookiesHeader();
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || (payload.exp && Date.now() > payload.exp * 1000)) {
    return null;
  }

  await connect();

  const user = await User.findById(payload.id).select(
    "currentBusiness name"
  );
  if (!user) return null;

  const currentMembership = await findActiveWorkspaceMembership({
    userId: payload.id,
    workspaceId: user.currentBusiness,
  }).lean<{
    role?: MembershipRoleValue | null;
    property?: unknown;
    unit?: unknown;
  } | null>();

  if (!currentMembership?.role) return null;

  const currentBusiness = await Business.findById(
    user.currentBusiness
  ).select("name");

  if (!currentBusiness) return null;

  // Check required role(s)
  if (
    requiredRoles &&
    !requiredRoles.includes(currentMembership.role as MembershipRoleValue)
  ) {
    return null;
  }

  return {
    id: payload.id,
    currentBusiness: user.currentBusiness,
    role: currentMembership.role as MembershipRoleValue,
    user,
    currentBusinessName: currentBusiness.name,
    property: currentMembership.property,
    unit: currentMembership.unit,
    isAdminRole: currentMembership.role === "ADMIN",
    isUserRole: currentMembership.role === ROLES.tenant,
    isSuperAdminRole: currentMembership.role === "SUPER_ADMIN",
    isTechnicianRole: currentMembership.role === "TECHNICIAN",
  };
}
