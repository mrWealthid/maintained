import "server-only";

import { randomBytes } from "crypto";

import AuthSession from "@/models/authSessionModel";
import type { WORKSPACE_ROLE } from "@/shared/auth/roles";
import type { ROLES } from "@/shared/enums/enums";

const ACTIVE_SESSION_REVOKED_AT = null;
const SESSION_ACTIVITY_REFRESH_MS = 30 * 1000;

export async function createAuthSession(args: {
  userId: string;
  businessId: string;
  role: ROLES;
  workspaceRole?: WORKSPACE_ROLE | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  maxActiveSessions?: number | "unlimited";
}) {
  const now = new Date();
  const sessionId = randomBytes(24).toString("hex");

  if (args.maxActiveSessions !== "unlimited") {
    const activeSessions = await AuthSession.find({
      user: args.userId,
      businessId: args.businessId,
      revokedAt: ACTIVE_SESSION_REVOKED_AT,
    })
      .sort({ lastSeenAt: 1, createdAt: 1 })
      .lean();

    const overflowCount =
      activeSessions.length -
      Math.max(0, Number(args.maxActiveSessions ?? 5)) +
      1;

    if (overflowCount > 0) {
      const sessionIdsToRevoke = activeSessions
        .slice(0, overflowCount)
        .map((session) => session.sessionId);

      if (sessionIdsToRevoke.length) {
        await AuthSession.updateMany(
          { sessionId: { $in: sessionIdsToRevoke } },
          { $set: { revokedAt: now } }
        );
      }
    }
  }

  await AuthSession.create({
    sessionId,
    user: args.userId,
    businessId: args.businessId,
    role: args.role,
    workspaceRole: args.workspaceRole ?? null,
    ipAddress: args.ipAddress ?? "",
    userAgent: args.userAgent ?? "",
    lastSeenAt: now,
  });

  return {
    sessionId,
    createdAt: now,
  };
}

export function getActiveAuthSession(args: {
  sessionId: string;
  userId: string;
}) {
  return AuthSession.findOne({
    sessionId: args.sessionId,
    user: args.userId,
    revokedAt: ACTIVE_SESSION_REVOKED_AT,
  });
}

export async function revokeAuthSession(sessionId: string) {
  await AuthSession.updateOne(
    { sessionId, revokedAt: ACTIVE_SESSION_REVOKED_AT },
    { $set: { revokedAt: new Date() } }
  );
}

export async function revokeAllAuthSessionsForUser(userId: string) {
  await AuthSession.updateMany(
    {
      user: userId,
      revokedAt: ACTIVE_SESSION_REVOKED_AT,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );
}

export async function touchAuthSession(sessionId: string, now = new Date()) {
  await AuthSession.updateOne(
    {
      sessionId,
      revokedAt: ACTIVE_SESSION_REVOKED_AT,
      $or: [
        {
          lastSeenAt: {
            $lt: new Date(now.getTime() - SESSION_ACTIVITY_REFRESH_MS),
          },
        },
        { lastSeenAt: { $exists: false } },
      ],
    },
    { $set: { lastSeenAt: now } }
  );
}
