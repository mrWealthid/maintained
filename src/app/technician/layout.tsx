import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { ROLES } from "@/shared/enums/enums";
import { DashboardChrome } from "@/shared/shells/DashboardChrome";

export default async function TechnicianDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardAccess({ roles: [ROLES.technician] });

  return <DashboardChrome role={ROLES.technician}>{children}</DashboardChrome>;
}
