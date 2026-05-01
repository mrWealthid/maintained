import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import PropertyManagementPageClient from "./PropertyManagementPageClient";

export default async function PropertyManagementPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.PROPERTIES_VIEW,
  });

  return <PropertyManagementPageClient />;
}
