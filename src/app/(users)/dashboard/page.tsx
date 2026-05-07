import { redirect } from "next/navigation";

import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import Business from "@/models/businessModel";
import User from "@/models/userModel";
import { DashboardAnalyticsView } from "@/features/dashboard/components/DashboardAnalyticsView";
import { getDashboardAnalytics } from "@/features/dashboard/service/dashboard-analytics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const verify = await getVerifiedUser();
  if (!verify) redirect("/auth/login");

  // Platform super admins don't have a tenant workspace and skip onboarding entirely.
  if (!isPlatformSuperAdminRole(verify.platformRole)) {
    const [business, user] = await Promise.all([
      Business.findById(verify.businessId)
        .select("onboardingCompletedAt")
        .lean<{ onboardingCompletedAt?: Date | null } | null>(),
      User.findById(verify.id)
        .select("memberships")
        .lean<{
          memberships?: Array<{ business?: unknown; isCreator?: boolean }>;
        } | null>(),
    ]);

    const isWorkspaceOwner =
      user?.memberships?.some(
        (m) =>
          m.isCreator === true &&
          String(m.business) === String(verify.businessId),
      ) ?? false;

    if (isWorkspaceOwner && !business?.onboardingCompletedAt) {
      redirect("/onboarding");
    }
  }

  const analytics = await getDashboardAnalytics(verify);

  return (
    <main className="flex flex-col gap-6">
      <DashboardAnalyticsView analytics={analytics} />
    </main>
  );
}
