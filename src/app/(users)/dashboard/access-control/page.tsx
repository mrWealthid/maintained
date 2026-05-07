import PlatformRolesManager from "@/features/access-control/components/PlatformRolesManager";
import TeamRolesManager from "@/features/access-control/components/TeamRolesManager";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";

export default async function AccessControlPage() {
  const verify = await requireDashboardAccess();
  const isSuperAdmin = isPlatformSuperAdminRole(verify.role);

  await requireDashboardAccess({
    requiredPermission: isSuperAdmin
      ? PERMISSION.PLATFORM_SETTINGS_VIEW
      : PERMISSION.TEAM_ROLE_MANAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <AppPageHeader name="Access Control" />
        <p className="text-sm text-muted-foreground">
          {isSuperAdmin
            ? "Review app-wide platform roles and their default permission configuration."
            : "Create and maintain workspace roles, then assign precise permission sets for your teams."}
        </p>
      </div>
      {isSuperAdmin ? <PlatformRolesManager /> : <TeamRolesManager />}
    </div>
  );
}
