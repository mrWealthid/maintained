// lib/auth/getVerifiedUser.ts
import { NextRequest } from "next/server";
import { verifyToken } from "./token";
import { cookies as getCookiesHeader } from "next/headers";
import User from "@/models/userModel";
import { ROLES } from "@/app/shared/enums/enums";

export async function getUserFromCookies(
  request?: NextRequest,
  requiredRoles?: ROLES[]
) {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get("token")?.value;
  } else {
    const cookieStore = await getCookiesHeader();
    token = cookieStore.get("token")?.value;
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

  // Check required role(s)
  if (requiredRoles && !requiredRoles.includes(currentMembership.role)) {
    return null;
  }

  return {
    id: payload.id,
    currentBusiness: user.currentBusiness,
    role: currentMembership.role,
    user,
    isAdminRole: currentMembership.role === "ADMIN",
    isUserRole: currentMembership.role === "USER",
    isSuperAdminRole: currentMembership.role === "SUPER_ADMIN",
    isTechnicianRole: currentMembership.role === "TECHNICIAN",
  };
}
