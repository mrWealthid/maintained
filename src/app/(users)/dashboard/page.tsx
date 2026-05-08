import { getVerifiedUser } from "@/lib/auth/getVerifiedUser";
import { DashboardAnalyticsView } from "@/features/dashboard/components/DashboardAnalyticsView";
import { getDashboardAnalytics } from "@/features/dashboard/service/dashboard-analytics";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const verify = await getVerifiedUser();
  if (!verify) redirect("/auth/login");

  const analytics = await getDashboardAnalytics(verify);

  return (
    <main className="flex flex-col gap-6">
      <DashboardAnalyticsView analytics={analytics} />
    </main>
  );
}
