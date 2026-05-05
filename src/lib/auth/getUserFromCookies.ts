// lib/auth/getVerifiedUser.ts
import { NextRequest } from "next/server";
import { verifyToken } from "./token";
import { cookies as getCookiesHeader } from "next/headers";
import User from "@/models/userModel";
import { ROLES } from "@/shared/enums/enums";
import Business from "@/models/businessModel";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

export async function getUserFromCookies(
  request?: NextRequest,
  requiredRoles?: ROLES[]
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

  const user = await User.findById(payload.id).select(
    "memberships currentBusiness name"
  );
  if (!user) return null;

  const currentMembership = user.memberships.find(
    (m) => m.business.toString() === user.currentBusiness.toString()
  );

  if (!currentMembership) return null;

  const currentBusiness = await Business.findById(
    currentMembership.business
  ).select("name");

  if (!currentBusiness) return null;

  // Check required role(s)
  if (requiredRoles && !requiredRoles.includes(currentMembership.role)) {
    return null;
  }

  return {
    id: payload.id,
    currentBusiness: user.currentBusiness,
    role: currentMembership.role,
    user,
    currentBusinessName: currentBusiness.name,
    property: currentMembership.property,
    unit: currentMembership.unit,
    isAdminRole: currentMembership.role === "ADMIN",
    isUserRole: currentMembership.role === "USER",
    isSuperAdminRole: currentMembership.role === "SUPER_ADMIN",
    isTechnicianRole: currentMembership.role === "TECHNICIAN",
  };
}
