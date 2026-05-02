import SettingsPage from "@/features/settings/components/SettingsPage";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";

export default async function UserSettingsPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.SETTINGS_VIEW,
  });

  return <SettingsPage />;
}
