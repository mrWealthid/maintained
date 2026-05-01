import { requireDashboardAccess } from "@/lib/auth/requireDashboardAccess";
import { ROLES } from "@/shared/enums/enums";
import { DashboardChrome } from "@/shared/shells/DashboardChrome";

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardAccess({ roles: [ROLES.user] });

  return <DashboardChrome role={ROLES.user}>{children}</DashboardChrome>;
}
