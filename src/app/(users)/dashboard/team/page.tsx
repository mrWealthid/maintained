import TeamManagementPageClient from "@/features/team/components/TeamManagementPageClient";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";

export default async function TeamManagementPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.TEAM_VIEW,
  });
  return <TeamManagementPageClient />;
}
