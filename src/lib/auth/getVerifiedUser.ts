// utils/auth/getUserFromCookies.ts
"use server";
import { cookies as getCookiesHeader } from "next/headers";
import { NextRequest } from "next/server";
import { verifyToken } from "./token";

/**
 * Reads the token from cookies and verifies it.
 * Automatically detects if it's running inside middleware or server context.
 * @param request Optional — only used in middleware (where headers.cookies doesn't work)
 */
export async function getVerifiedUser(request?: NextRequest): Promise<{
  id: string;

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

  return {
    id: payload.id,
    currentBusiness: payload.currentBusiness,
  };
}
