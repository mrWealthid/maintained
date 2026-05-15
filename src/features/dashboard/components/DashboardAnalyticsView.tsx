"use client";

import { Badge } from "@/components/ui/badge";
import AppPageHeader from "@/shared/components/app-header/AppPageHeader";
import { DASHBOARD_SCOPE } from "../models/dashboard.model";
import type { DashboardAnalytics } from "../models/dashboard.model";
import { AdminDashboard } from "./admin-dashboard";
import { TechnicianDashboard } from "./technician-dashboard";
import { TenantDashboard } from "./tenant-dashboard";

export function DashboardAnalyticsView({
  analytics,
}: {
  analytics: DashboardAnalytics;
}) {
  return (
    <div className="space-y-4">
      <AppPageHeader
        title={analytics.title}
        description={analytics.subtitle}
        actions={
          <Badge variant="outline" className="w-fit rounded px-1.5 py-0 text-[10px] uppercase">
            {analytics.scope} scope
          </Badge>
        }
      />
      {renderDashboardByScope(analytics)}
    </div>
  );
}

function renderDashboardByScope(analytics: DashboardAnalytics) {
  if (analytics.scope === DASHBOARD_SCOPE.technician) {
    return <TechnicianDashboard data={analytics} />;
  }

  if (analytics.scope === DASHBOARD_SCOPE.user) {
    return <TenantDashboard data={analytics} />;
  }

  return <AdminDashboard data={analytics} />;
}
