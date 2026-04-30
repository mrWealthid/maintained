import { redirect } from "next/navigation";

import { ROLES } from "@/shared/enums/enums";
import { getUserFromCookies } from "./getUserFromCookies";
import {
  hasPermission,
  type PermissionContext,
} from "./permission-guards";
import {
  isPlatformSuperAdminRole,
  resolveWorkspaceRole,
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
};

function dashboardPathForRole(role: ROLES | string): string {
  if (role === ROLES.admin || role === ROLES.owner) {
    return "/admin/dashboard";
  }
  if (role === ROLES.technician) {
    return "/technician/dashboard";
  }
  return "/dashboard";
}

export async function requireDashboardAccess(
  options: DashboardAccessOptions = {},
) {
  const user = await getUserFromCookies();

  if (!user) {
    redirect(options.loginPath ?? "/auth/login");
  }

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
      platformRole: isPlatformSuperAdminRole(user.role)
        ? user.role
        : null,
      workspaceRole: resolveWorkspaceRole({ storedRole: user.role }),
    };

    if (!hasPermission(ctx, options.requiredPermission)) {
      redirect(options.forbiddenPath ?? dashboardPathForRole(user.role));
    }
  }

  return user;
}
