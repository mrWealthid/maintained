import mongoose from "mongoose";

import type { VerifiedUser } from "@/lib/auth/getVerifiedUser";
import { isPlatformSuperAdminRole } from "@/shared/auth/roles";
import { INVITE_STATUS, ROLES } from "@/shared/enums/enums";
import type {
  DashboardAnalytics,
  DashboardChartPoint,
  DashboardInsight,
  DashboardTrendPoint,
} from "../models/dashboard.model";
import { DASHBOARD_SCOPE } from "../models/dashboard.model";
import { DASHBOARD_MONTH_WINDOW } from "./dashboard-analytics.constants";
import {
  addMonths,
  formatCurrency,
  percent,
  plural,
  startOfMonth,
  titleCase,
} from "./dashboard-formatters";

export type DashboardCountRow = { _id: string | null; count: number };

export function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export function resolveDashboardScope(
  verify: VerifiedUser,
): DashboardAnalytics["scope"] {
  if (
    isPlatformSuperAdminRole(verify.platformRole) ||
    verify.role === ROLES.super_admin
  ) {
    return DASHBOARD_SCOPE.platform;
  }
  if (verify.role === ROLES.technician) return DASHBOARD_SCOPE.technician;
  if (verify.role === ROLES.tenant) return DASHBOARD_SCOPE.user;
  return DASHBOARD_SCOPE.workspace;
}

export function buildDashboardTicketFilter(args: {
  scope: DashboardAnalytics["scope"];
  businessObjectId: mongoose.Types.ObjectId;
  userObjectId: mongoose.Types.ObjectId;
}) {
  if (args.scope === DASHBOARD_SCOPE.platform) return {};

  const filter: Record<string, unknown> = { business: args.businessObjectId };

  if (args.scope === DASHBOARD_SCOPE.technician) {
    filter.assignedTo = args.userObjectId;
  }

  if (args.scope === DASHBOARD_SCOPE.user) {
    filter.user = args.userObjectId;
  }

  return filter;
}

export function buildTechnicianRequestMatch(
  scope: DashboardAnalytics["scope"],
  userObjectId: mongoose.Types.ObjectId,
) {
  if (scope === DASHBOARD_SCOPE.technician) return { technician: userObjectId };
  if (scope === DASHBOARD_SCOPE.user) return { _id: { $exists: false } };
  if (scope === DASHBOARD_SCOPE.platform) return {};
  return {};
}

export function ticketBusinessLookupMatch(
  businessObjectId: mongoose.Types.ObjectId,
) {
  return [
    {
      $lookup: {
        from: "tickets",
        localField: "ticket",
        foreignField: "_id",
        as: "ticketDoc",
      },
    },
    { $unwind: "$ticketDoc" },
    { $match: { "ticketDoc.business": businessObjectId } },
  ];
}

export function orderedCounts<T extends string>(
  rows: DashboardCountRow[],
  order: readonly T[],
): DashboardChartPoint[] {
  const counts = new Map(rows.map((row) => [row._id ?? "Unknown", row.count]));
  return order.map((item) => ({
    label: titleCase(item),
    value: counts.get(item) ?? 0,
  }));
}

export function mergeMonthlyTrend(
  created: DashboardCountRow[],
  completed: DashboardCountRow[],
): DashboardTrendPoint[] {
  const createdMap = new Map(created.map((row) => [row._id ?? "", row.count]));
  const completedMap = new Map(
    completed.map((row) => [row._id ?? "", row.count]),
  );

  return Array.from({ length: DASHBOARD_MONTH_WINDOW }, (_, index) => {
    const date = addMonths(
      startOfMonth(new Date()),
      index - (DASHBOARD_MONTH_WINDOW - 1),
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      created: createdMap.get(key) ?? 0,
      completed: completedMap.get(key) ?? 0,
    };
  });
}

export function buildDashboardMetrics(args: {
  scope: DashboardAnalytics["scope"];
  operations: DashboardAnalytics["operations"];
  portfolio: DashboardAnalytics["portfolio"];
  team: DashboardAnalytics["team"];
  technician: DashboardAnalytics["technician"];
  activeBusinesses: number;
}) {
  if (args.scope === DASHBOARD_SCOPE.platform) {
    return [
      { id: "workspaces", label: "Active Workspaces", value: args.activeBusinesses },
      { id: "tickets", label: "Total Tickets", value: args.operations.totalTickets },
      { id: "open", label: "Open Tickets", value: args.operations.openTickets },
      { id: "team", label: "Platform Members", value: args.team.total },
    ];
  }

  if (args.scope === DASHBOARD_SCOPE.technician) {
    return [
      { id: "assigned", label: "Assigned Work", value: args.technician.assignedTickets },
      { id: "requests", label: "Requests", value: args.technician.requestCount },
      { id: "visits", label: "Upcoming Visits", value: args.technician.upcomingVisits },
      {
        id: "quote",
        label: "Avg. Quote",
        value: formatCurrency(args.technician.averageQuote),
      },
    ];
  }

  if (args.scope === DASHBOARD_SCOPE.user) {
    return [
      { id: "tickets", label: "My Tickets", value: args.operations.totalTickets },
      { id: "open", label: "Open", value: args.operations.openTickets },
      { id: "completed", label: "Completed", value: args.operations.completedTickets },
      { id: "related", label: "Linked Repairs", value: args.operations.relatedTickets },
    ];
  }

  return [
    { id: "open", label: "Open Tickets", value: args.operations.openTickets },
    { id: "high", label: "High Priority", value: args.operations.highPriorityOpen },
    { id: "occupancy", label: "Occupancy", value: `${args.portfolio.occupancyRate}%` },
    { id: "technicians", label: "Technicians", value: args.team.technicians },
  ];
}

export function buildDashboardInsights(args: {
  operations: DashboardAnalytics["operations"];
  portfolio: DashboardAnalytics["portfolio"];
  technician: DashboardAnalytics["technician"];
}): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  if (args.operations.highPriorityOpen > 0) {
    insights.push({
      id: "high-priority",
      title: "High-priority backlog",
      detail: `${args.operations.highPriorityOpen} high-priority ticket${plural(args.operations.highPriorityOpen)} still open.`,
      tone: args.operations.highPriorityOpen > 5 ? "critical" : "warning",
      value: args.operations.highPriorityOpen,
      action: "View tickets",
    });
  }

  if (args.operations.overdueTickets > 0) {
    insights.push({
      id: "overdue",
      title: "Overdue work",
      detail: `${args.operations.overdueTickets} ticket${plural(args.operations.overdueTickets)} past due date.`,
      tone: "critical",
      value: args.operations.overdueTickets,
      action: "Review overdue",
    });
  }

  if (args.portfolio.units > 0 && args.portfolio.occupancyRate < 85) {
    insights.push({
      id: "occupancy",
      title: "Occupancy below target",
      detail: `${args.portfolio.vacantUnits} unit${plural(args.portfolio.vacantUnits)} currently vacant.`,
      tone: "warning",
      value: `${args.portfolio.occupancyRate}%`,
      action: "View units",
    });
  }

  if (args.technician.pendingRequests > 0) {
    insights.push({
      id: "technician-requests",
      title: "Technician responses pending",
      detail: `${args.technician.pendingRequests} technician request${plural(args.technician.pendingRequests)} awaiting response.`,
      tone: "info",
      value: args.technician.pendingRequests,
      action: "Check requests",
    });
  }

  if (!insights.length) {
    insights.push({
      id: "healthy",
      title: "Operations look steady",
      detail: "No high-risk backlog, overdue work, or occupancy alerts detected.",
      tone: "success",
      action: "View trend",
    });
  }

  return insights.slice(0, 4);
}

export function getDashboardTitle(scope: DashboardAnalytics["scope"]) {
  if (scope === DASHBOARD_SCOPE.platform) return "Platform Dashboard";
  if (scope === DASHBOARD_SCOPE.technician) return "Technician Dashboard";
  if (scope === DASHBOARD_SCOPE.user) return "My Maintenance Dashboard";
  return "Operations Dashboard";
}

export function getDashboardSubtitle(scope: DashboardAnalytics["scope"]) {
  if (scope === DASHBOARD_SCOPE.platform) {
    return "Workspace health, tickets, and team activity.";
  }
  if (scope === DASHBOARD_SCOPE.technician) {
    return "Assigned work, requests, quotes, and schedule.";
  }
  if (scope === DASHBOARD_SCOPE.user) {
    return "Your unit requests, repair progress, and recent history.";
  }
  return "Portfolio, maintenance, team, and technician performance.";
}

export function roleCount(
  rows: Array<{ _id: { role: ROLES }; count: number }>,
  role: ROLES,
) {
  return rows
    .filter((row) => row._id.role === role)
    .reduce((sum, row) => sum + row.count, 0);
}

export { percent };
