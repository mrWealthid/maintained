import SettingsPage from "@/features/settings/components/SettingsPage";
import { AppSettingsShell } from "@/features/settings/components/AppSettingsShell";
import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";

export default async function UserSettingsPage() {
  const verify = await requireDashboardAccess();

  if (isPlatformSuperAdminRole(verify.role)) {
    return <AppSettingsShell />;
  }

  return <SettingsPage />;
}
