import type {
  ROLES,
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";

export type DashboardRole = "admin" | "technician" | "user";

export type DashboardMetric = {
  id: string;
  label: string;
  value: number | string;
  delta?: number;
};

export type DashboardListQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export const DASHBOARD_SCOPE = {
  platform: "platform",
  workspace: "workspace",
  technician: "technician",
  user: "user",
} as const;

export type DashboardScope =
  (typeof DASHBOARD_SCOPE)[keyof typeof DASHBOARD_SCOPE];

export type DashboardChartPoint = {
  label: string;
  value: number;
};

export type DashboardTrendPoint = {
  label: string;
  created: number;
  completed: number;
};

export type DashboardPropertyLoad = {
  propertyId?: string;
  name: string;
  propertyType?: "HOUSE" | "BUILDING" | "STATION";
  total: number;
  open: number;
  highPriority: number;
  overdue: number;
};

export type DashboardRecentTicket = {
  id: string;
  title: string;
  status: TICKET_STATUS;
  priority: TICKET_PRIORITY;
  propertyName?: string;
  unitLabel?: string;
  createdAt: string;
  dueDate?: string;
  area?: string;
  assignedTo?: string;
};

export type DashboardInsight = {
  id: string;
  title: string;
  detail: string;
  tone: "success" | "warning" | "critical" | "info";
  value?: string | number;
  action?: string;
};

export type DashboardAnalytics = {
  role: ROLES;
  scope: DashboardScope;
  title: string;
  subtitle: string;
  metrics: Array<DashboardMetric & { helper?: string }>;
  statusBreakdown: DashboardChartPoint[];
  priorityBreakdown: DashboardChartPoint[];
  monthlyTrend: DashboardTrendPoint[];
  propertyLoad: DashboardPropertyLoad[];
  technicianRequests: DashboardChartPoint[];
  recentTickets: DashboardRecentTicket[];
  insights: DashboardInsight[];
  operations: {
    totalTickets: number;
    openTickets: number;
    completedTickets: number;
    highPriorityOpen: number;
    relatedTickets: number;
    overdueTickets: number;
    completionRate: number;
    averageCompletionHours: number | null;
  };
  portfolio: {
    properties: number;
    units: number;
    occupiedUnits: number;
    vacantUnits: number;
    occupancyRate: number;
    averageRent: number | null;
  };
  team: {
    total: number;
    active: number;
    invited: number;
    technicians: number;
    admins: number;
    tenants: number;
    byRole: DashboardTeamRoleBreakdown[];
  };
  technician: {
    assignedTickets: number;
    requestCount: number;
    selectedRequests: number;
    pendingRequests: number;
    upcomingVisits: number;
    averageQuote: number | null;
    currency: string;
    byStatus: DashboardTechnicianRequestBreakdown[];
  };
  technicianView: {
    schedule: DashboardTechnicianScheduleEntry[];
    quoteRequests: DashboardTechnicianQuoteRequest[];
    assignedTickets: DashboardRecentTicket[];
  };
  tenantView: {
    unit: DashboardTenantUnit | null;
    pendingTickets: number;
  };
};

export type DashboardTeamRoleBreakdown = {
  role: ROLES;
  active: number;
  invited: number;
};

export type DashboardTechnicianRequestBreakdown = {
  status: TECHNICIAN_RESPONSE;
  count: number;
};

export type DashboardTechnicianScheduleEntry = {
  id: string;
  ticketId: string;
  ticketTitle: string;
  propertyName?: string;
  unitLabel?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status: TICKET_STATUS;
  priority: TICKET_PRIORITY;
};

export type DashboardTechnicianQuoteRequest = {
  id: string;
  ticketTitle: string;
  propertyName?: string;
  status: TECHNICIAN_RESPONSE;
  quoteTotal?: number;
  currency: string;
  expiresAt?: string;
  message?: string;
};

export type DashboardTenantUnit = {
  label: string;
  floor?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqft?: number;
  monthlyRent?: number;
  currency: string;
  propertyName?: string;
};
