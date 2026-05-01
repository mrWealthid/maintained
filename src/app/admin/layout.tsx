import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { ROLES } from "@/shared/enums/enums";
import { DashboardChrome } from "@/shared/shells/DashboardChrome";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardAccess({ roles: [ROLES.admin, ROLES.owner] });

  return <DashboardChrome role={ROLES.admin}>{children}</DashboardChrome>;
}
