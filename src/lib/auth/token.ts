import { ROLES } from "@/shared/enums/enums";
import jwt, { JwtPayload } from "jsonwebtoken";

export type UserRole = "ADMIN" | "SUPER_ADMIN" | "TECHNICIAN" | "USER";

export interface TokenPayload extends JwtPayload {
  id: string;
  role: ROLES;
  currentBusiness: string;
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
