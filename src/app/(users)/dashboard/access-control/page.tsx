import TeamRolesManager from "@/features/access-control/components/TeamRolesManager";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";

export default async function AccessControlPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.TEAM_ROLE_MANAGE,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <AppPageHeader name="Access Control" />
        <p className="text-sm text-muted-foreground">
          Create and maintain workspace roles, then assign precise permission
          sets for your teams.
        </p>
      </div>
      <TeamRolesManager />
    </div>
  );
}
