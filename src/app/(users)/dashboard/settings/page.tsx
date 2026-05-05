import SettingsPage from "@/features/settings/components/SettingsPage";
import { AppSettingsShell } from "@/features/settings/components/AppSettingsShell";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import { PERMISSION } from "@/shared/auth/permission-registry";

export default async function UserSettingsPage() {
  const verify = await requireDashboardAccess({
    requiredPermission: PERMISSION.SETTINGS_VIEW,
  });

  if (isPlatformSuperAdminRole(verify.role)) {
    return <AppSettingsShell />;
  }

  return <SettingsPage />;
}
