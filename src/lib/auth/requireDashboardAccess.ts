import { redirect } from "next/navigation";

import { ROLES } from "@/shared/enums/enums";
import {
  getVerifiedUserState,
  VERIFIED_USER_STATE_STATUS,
} from "./getVerifiedUser";
import { hasPermission, type PermissionContext } from "./permission-guards";
import {
  isPlatformSuperAdminRole,
} from "@/shared/auth/roles";
import type { PermissionKey } from "@/shared/auth/permission-registry";

/**
 * Page-level guard for dashboard routes. Replaces the duplicated
 * getUserFromCookies + redirect("/auth/login") + manual role check
 * pattern that lives in nearly every dashboard page.
 *
 * Usage:
 *   await requireDashboardAccess();
 *   await requireDashboardAccess({ roles: [ROLES.admin] });
 *   await requireDashboardAccess({
 *     roles: [ROLES.admin, ROLES.owner],
 *     requiredPermission: PERMISSION.TICKETS_ASSIGN,
 *   });
 */

type DashboardAccessOptions = {
  roles?: readonly ROLES[];
  requiredPermission?: PermissionKey;
  loginPath?: string;
  forbiddenPath?: string;
  nextPath?: string;
};

function dashboardPathForRole(role: ROLES | string): string {
  void role;
  return "/dashboard";
}

export async function requireDashboardAccess(
  options: DashboardAccessOptions = {},
) {
  const verifyState = await getVerifiedUserState();

  if (verifyState.status === VERIFIED_USER_STATE_STATUS.UNAUTHENTICATED) {
    const nextPath = options.nextPath ?? "/dashboard";
    redirect(
      options.loginPath ??
        `/auth/session-expired?next=${encodeURIComponent(nextPath)}`,
    );
  }

  if (verifyState.status === VERIFIED_USER_STATE_STATUS.INACTIVE_BUSINESS) {
    redirect(options.forbiddenPath ?? "/auth/inactive-business");
  }

  const user = verifyState.user;
  const roles = options.roles;
  if (roles?.length) {
    const allowed = roles.some((role) => {
      if (role === ROLES.super_admin) {
        return isPlatformSuperAdminRole(user.role);
      }
      return user.role === role;
    });

    if (!allowed) {
      redirect(options.forbiddenPath ?? dashboardPathForRole(user.role));
    }
  }

  if (options.requiredPermission) {
    const ctx: PermissionContext = {
      userId: user.id,
      businessId: user.businessId,
      platformRole: user.platformRole,
      workspaceRole: user.workspaceRole,
    };

    if (!(await hasPermission(ctx, options.requiredPermission))) {
      redirect(options.forbiddenPath ?? dashboardPathForRole(user.role));
    }
  }

  return user;
}
