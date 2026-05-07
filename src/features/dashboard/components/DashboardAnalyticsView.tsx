"use client";

import { Badge } from "@/components/ui/badge";
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
      <DashboardPageHeader analytics={analytics} />
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

function DashboardPageHeader({ analytics }: { analytics: DashboardAnalytics }) {
  return (
    <div className="flex flex-col gap-2 border-b pb-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-sm font-semibold leading-none text-foreground">
          {analytics.title}
        </h1>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {analytics.subtitle}
        </p>
      </div>
      <Badge variant="outline" className="w-fit rounded px-1.5 py-0 text-[10px] uppercase">
        {analytics.scope} scope
      </Badge>
    </div>
  );
}
