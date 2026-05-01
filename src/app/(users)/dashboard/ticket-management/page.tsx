import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import TicketManagementPageClient from "./TicketManagementPageClient";

export default async function TicketManagementPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.TICKETS_VIEW,
  });

  return <TicketManagementPageClient />;
}
