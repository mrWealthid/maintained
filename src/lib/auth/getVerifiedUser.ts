// utils/auth/getUserFromCookies.ts
"use server";
import { cookies as getCookiesHeader } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken, TokenPayload } from "./token";
import User from "@/models/userModel";
import { ROLES } from "@/app/shared/enums/enums";
import mongoose from "mongoose";

/**
 * Reads the token from cookies and verifies it.
 * Automatically detects if it's running inside middleware or server context.
 * @param request Optional — only used in middleware (where headers.cookies doesn't work)
 */
export async function getVerifiedUser(request?: NextRequest): Promise<{
  id: string;
  // role: string;
  // isAdminRole: boolean;
  // isUserRole: boolean;
  // isSuperAdminRole: boolean;
  // isTechnicianRole: boolean;
  currentBusiness: string;
} | null> {
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

  // Dynamically determine role in current business
  // const user = await User.findById(
  // 	new mongoose.Types.ObjectId(payload.id)
  // ).lean();

  // console.log('test...', user);
  // if (!user) return null;

  // const membership = user.memberships.find(
  // 	(m) => m.business.toString() === user.currentBusiness.toString()
  // );

  // console.log('mber', membership);
  // console.log('mber', membership?.role);

  // const role = membership?.role || 'USER';

  return {
    id: payload.id,
    // role,
    currentBusiness: payload.currentBusiness,
    // isAdminRole: role === 'ADMIN',
    // isUserRole: role === 'USER',
    // isSuperAdminRole: role === 'SUPER_ADMIN',
    // isTechnicianRole: role === 'TECHNICIAN'
  };
}
