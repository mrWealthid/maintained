import { ROLES } from "@/shared/enums/enums";
import type { PLATFORM_ROLE, WORKSPACE_ROLE } from "@/shared/auth/roles";
import jwt, { JwtPayload } from "jsonwebtoken";

export type UserRole =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "TECHNICIAN"
  | "TENANT"
  | "USER";

export interface TokenPayload extends JwtPayload {
  id: string;
  role: ROLES;
  currentBusiness: string;
  businessId?: string;
  platformRole?: PLATFORM_ROLE | null;
  workspaceRole?: WORKSPACE_ROLE | null;
  sessionId?: string;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
}
