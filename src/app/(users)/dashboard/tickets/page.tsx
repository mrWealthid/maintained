import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { PERMISSION } from "@/shared/auth/permission-registry";
import TicketsPageClient from "./TicketsPageClient";

export default async function TicketsPage() {
  await requireDashboardAccess({
    requiredPermission: PERMISSION.TICKETS_VIEW,
  });

  return <TicketsPageClient />;
}
