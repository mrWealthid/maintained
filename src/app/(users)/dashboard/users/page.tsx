import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import UserManagementPageClient from "./UserManagementPageClient";

export default async function UserManagementPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.TEAM_VIEW,
  });

  return <UserManagementPageClient />;
}
