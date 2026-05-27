import "server-only";

import mongoose from "mongoose";

import { connect } from "@/dbConfig/dbConfig";
import Business from "@/models/businessModel";
import Property from "@/models/propertyModel";
import { TechnicianRequest } from "@/models/technicanRequest";
import Ticket from "@/models/ticketModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import type { VerifiedUser } from "@/lib/auth/getVerifiedUser";
import { findActiveWorkspaceMembership } from "@/lib/tenancy/workspace-membership-access";
import {
  INVITE_STATUS,
  ROLES,
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import {
  DASHBOARD_MONTH_WINDOW,
  DASHBOARD_OPEN_TICKET_STATUSES,
  DASHBOARD_PRIORITY_ORDER,
  DASHBOARD_TECHNICIAN_REQUEST_STATUS_ORDER,
  DASHBOARD_TICKET_STATUS_ORDER,
} from "../helper/dashboard-analytics.constants";
import {
  buildDashboardInsights,
  buildDashboardMetrics,
  buildDashboardTicketFilter,
  buildTechnicianRequestMatch,
  getDashboardSubtitle,
  getDashboardTitle,
  mergeMonthlyTrend,
  orderedCounts,
  percent,
  resolveDashboardScope,
  roleCount,
  ticketBusinessLookupMatch,
  toObjectId,
  type DashboardCountRow,
} from "../helper/dashboard-analytics.helper";
import {
  addMonths,
  nullableNumber,
  startOfMonth,
} from "../helper/dashboard-formatters";
import type {
  DashboardAnalytics,
  DashboardRecentTicket,
  DashboardTeamRoleBreakdown,
  DashboardTechnicianQuoteRequest,
  DashboardTechnicianRequestBreakdown,
  DashboardTechnicianScheduleEntry,
  DashboardTenantUnit,
} from "../models/dashboard.model";
import { DASHBOARD_SCOPE } from "../models/dashboard.model";

export async function getDashboardAnalytics(
  verify: VerifiedUser,
): Promise<DashboardAnalytics> {
  await connect();

  const businessObjectId = toObjectId(verify.businessId);
  const userObjectId = toObjectId(verify.id);
  const scope = resolveDashboardScope(verify);
  const tenantLocation = await getTenantLocation(verify, userObjectId);

  const ticketFilter = buildDashboardTicketFilter({
    scope,
    businessObjectId,
    userObjectId,
  });
  const workspaceFilter =
    scope === DASHBOARD_SCOPE.platform ? {} : { business: businessObjectId };
  const now = new Date();

  const [
    totalTickets,
    completedTickets,
    openTickets,
    highPriorityOpen,
    relatedTickets,
    overdueTickets,
    statusCounts,
    priorityCounts,
    monthlyCreated,
    monthlyCompleted,
    propertyLoad,
    recentTickets,
    portfolio,
    team,
    technician,
    technicianView,
    tenantView,
    requestCounts,
    activeBusinesses,
    avgCompletion,
  ] = await Promise.all([
    Ticket.countDocuments(ticketFilter),
    Ticket.countDocuments({ ...ticketFilter, status: TICKET_STATUS.completed }),
    Ticket.countDocuments({
      ...ticketFilter,
      status: { $in: DASHBOARD_OPEN_TICKET_STATUSES },
    }),
    Ticket.countDocuments({
      ...ticketFilter,
      priority: { $in: [TICKET_PRIORITY.emergency, TICKET_PRIORITY.high] },
      status: { $in: DASHBOARD_OPEN_TICKET_STATUSES },
    }),
    Ticket.countDocuments({
      ...ticketFilter,
      relatedTo: { $exists: true, $ne: null },
    }),
    Ticket.countDocuments({
      ...ticketFilter,
      dueDate: { $lt: now },
      status: { $nin: [TICKET_STATUS.completed, TICKET_STATUS.declined] },
    }),
    countByTicketField(ticketFilter, "status"),
    countByTicketField(ticketFilter, "priority"),
    monthlyTicketCounts(ticketFilter, "createdAt"),
    monthlyTicketCounts(
      { ...ticketFilter, status: TICKET_STATUS.completed },
      "completedAt",
    ),
    getPropertyLoad(ticketFilter, now),
    getRecentTickets(ticketFilter),
    getPortfolioStats(scope, workspaceFilter, tenantLocation),
    getTeamStats(scope, businessObjectId),
    getTechnicianStats(scope, userObjectId, businessObjectId),
    getTechnicianView(scope, userObjectId),
    getTenantView(scope, tenantLocation),
    getTechnicianRequestBreakdown(scope, userObjectId, businessObjectId),
    scope === DASHBOARD_SCOPE.platform
      ? Business.countDocuments({ active: { $ne: false } })
      : 0,
    averageCompletionHours(ticketFilter),
  ]);

  const operations = {
    totalTickets,
    openTickets,
    completedTickets,
    highPriorityOpen,
    relatedTickets,
    overdueTickets,
    completionRate: percent(completedTickets, totalTickets),
    averageCompletionHours: avgCompletion,
  };
  const technicianWithBreakdown = {
    ...technician,
    currency: "USD",
    byStatus: toTechnicianStatusBreakdown(requestCounts),
  };

  return {
    role: verify.role,
    scope,
    title: getDashboardTitle(scope),
    subtitle: getDashboardSubtitle(scope),
    metrics: buildDashboardMetrics({
      scope,
      operations,
      portfolio,
      team,
      technician: technicianWithBreakdown,
      activeBusinesses,
    }),
    statusBreakdown: orderedCounts(statusCounts, DASHBOARD_TICKET_STATUS_ORDER),
    priorityBreakdown: orderedCounts(priorityCounts, DASHBOARD_PRIORITY_ORDER),
    monthlyTrend: mergeMonthlyTrend(monthlyCreated, monthlyCompleted),
    propertyLoad,
    technicianRequests: orderedCounts(
      requestCounts,
      DASHBOARD_TECHNICIAN_REQUEST_STATUS_ORDER,
    ),
    recentTickets,
    insights: buildDashboardInsights({
      operations,
      portfolio,
      technician: technicianWithBreakdown,
    }),
    operations,
    portfolio,
    team,
    technician: technicianWithBreakdown,
    technicianView,
    tenantView,
  };
}

async function getTenantLocation(
  verify: VerifiedUser,
  userObjectId: mongoose.Types.ObjectId,
) {
  if (verify.role !== ROLES.tenant) return {};

  const activeMembership = await findActiveWorkspaceMembership({
    userId: userObjectId,
    workspaceId: verify.businessId,
  }).lean<{
    property?: mongoose.Types.ObjectId | null;
    unit?: mongoose.Types.ObjectId | null;
  } | null>();

  if (activeMembership?.property || activeMembership?.unit) {
    return {
      property: activeMembership.property ?? undefined,
      unit: activeMembership.unit ?? undefined,
    };
  }

  const user = await User.findById(userObjectId)
    .select("memberships")
    .lean<{
      memberships?: Array<{
        business?: mongoose.Types.ObjectId;
        property?: mongoose.Types.ObjectId;
        unit?: mongoose.Types.ObjectId;
      }>;
    } | null>();
  const membership = user?.memberships?.find(
    (item) => String(item.business) === verify.businessId,
  );

  return {
    property: membership?.property,
    unit: membership?.unit,
  };
}

async function countByTicketField(
  filter: Record<string, unknown>,
  field: string,
) {
  return Ticket.aggregate<DashboardCountRow>([
    { $match: filter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);
}

async function monthlyTicketCounts(
  filter: Record<string, unknown>,
  dateField: string,
) {
  const start = startOfMonth(addMonths(new Date(), -(DASHBOARD_MONTH_WINDOW - 1)));
  return Ticket.aggregate<DashboardCountRow>([
    {
      $match: {
        ...filter,
        [dateField]: { $gte: start, $ne: null },
      },
    },
    {
      $group: {
        _id: { $dateToString: { date: `$${dateField}`, format: "%Y-%m" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

async function getPropertyLoad(filter: Record<string, unknown>, now: Date) {
  return Ticket.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$property",
        name: { $first: { $ifNull: ["$propertyName", "Unassigned"] } },
        total: { $sum: 1 },
        open: {
          $sum: {
            $cond: [{ $in: ["$status", DASHBOARD_OPEN_TICKET_STATUSES] }, 1, 0],
          },
        },
        highPriority: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$priority",
                  [TICKET_PRIORITY.emergency, TICKET_PRIORITY.high],
                ],
              },
              1,
              0,
            ],
          },
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", now] },
                  {
                    $not: [
                      {
                        $in: [
                          "$status",
                          [TICKET_STATUS.completed, TICKET_STATUS.declined],
                        ],
                      },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: "properties",
        localField: "_id",
        foreignField: "_id",
        as: "propertyDoc",
      },
    },
    { $unwind: { path: "$propertyDoc", preserveNullAndEmptyArrays: true } },
    { $sort: { open: -1, total: -1 } },
    { $limit: 6 },
    {
      $project: {
        _id: 0,
        propertyId: { $toString: "$_id" },
        name: { $ifNull: ["$propertyDoc.name", "$name"] },
        propertyType: "$propertyDoc.type",
        total: 1,
        open: 1,
        highPriority: 1,
        overdue: 1,
      },
    },
  ]);
}

async function getRecentTickets(filter: Record<string, unknown>) {
  const tickets = await Ticket.find(filter)
    .select("title area status priority propertyName unitLabel createdAt dueDate assignedTo")
    .sort({ createdAt: -1 })
    .limit(6)
    .populate({ path: "assignedTo", select: "name" })
    .lean<
      Array<{
        _id: mongoose.Types.ObjectId;
        title: string;
        status: TICKET_STATUS;
        priority: TICKET_PRIORITY;
        propertyName?: string;
        unitLabel?: string;
        createdAt: Date;
        dueDate?: Date;
        area?: string;
        assignedTo?: { name?: string };
      }>
    >();

  return tickets.map<DashboardRecentTicket>((ticket) => ({
    id: ticket._id.toString(),
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    propertyName: ticket.propertyName,
    unitLabel: ticket.unitLabel,
    createdAt: ticket.createdAt.toISOString(),
    dueDate: ticket.dueDate?.toISOString(),
    area: ticket.area,
    assignedTo: ticket.assignedTo?.name,
  }));
}

async function getTechnicianView(
  scope: DashboardAnalytics["scope"],
  userObjectId: mongoose.Types.ObjectId,
) {
  if (scope !== DASHBOARD_SCOPE.technician) {
    return { schedule: [], quoteRequests: [], assignedTickets: [] };
  }

  const now = new Date();
  const [scheduleRows, quoteRows, assignedTickets] = await Promise.all([
    TechnicianRequest.find({
      technician: userObjectId,
      "schedule.date": { $gte: now },
    })
      .sort({ "schedule.date": 1 })
      .limit(6)
      .populate({
        path: "ticket",
        select: "title status priority propertyName unitLabel",
      })
      .lean<Array<{
        _id: mongoose.Types.ObjectId;
        ticket?: {
          _id: mongoose.Types.ObjectId;
          title?: string;
          status?: TICKET_STATUS;
          priority?: TICKET_PRIORITY;
          propertyName?: string;
          unitLabel?: string;
        };
        schedule?: { date?: Date; start?: string; end?: string };
      }>>(),
    TechnicianRequest.find({
      technician: userObjectId,
      status: {
        $in: [
          TECHNICIAN_RESPONSE.pending,
          TECHNICIAN_RESPONSE.applied,
          TECHNICIAN_RESPONSE.inspection_requested,
          TECHNICIAN_RESPONSE.selected,
        ],
      },
    })
      .sort({ expiresAt: 1 })
      .limit(6)
      .populate({ path: "ticket", select: "title propertyName" })
      .lean<Array<{
        _id: mongoose.Types.ObjectId;
        ticket?: { title?: string; propertyName?: string };
        status: TECHNICIAN_RESPONSE;
        quote?: { total?: number; currency?: string };
        expiresAt?: Date;
        message?: string;
      }>>(),
    getRecentTickets({
      assignedTo: userObjectId,
      status: { $in: DASHBOARD_OPEN_TICKET_STATUSES },
    }),
  ]);

  return {
    schedule: scheduleRows.map<DashboardTechnicianScheduleEntry>((row) => ({
      id: row._id.toString(),
      ticketId: row.ticket?._id?.toString() ?? "",
      ticketTitle: row.ticket?.title ?? "Untitled ticket",
      propertyName: row.ticket?.propertyName,
      unitLabel: row.ticket?.unitLabel,
      date: row.schedule?.date?.toISOString(),
      startTime: row.schedule?.start,
      endTime: row.schedule?.end,
      status: row.ticket?.status ?? TICKET_STATUS.assigned,
      priority: row.ticket?.priority ?? TICKET_PRIORITY.medium,
    })),
    quoteRequests: quoteRows.map<DashboardTechnicianQuoteRequest>((row) => ({
      id: row._id.toString(),
      ticketTitle: row.ticket?.title ?? "Untitled ticket",
      propertyName: row.ticket?.propertyName,
      status: row.status,
      quoteTotal: row.quote?.total,
      currency: row.quote?.currency ?? "USD",
      expiresAt: row.expiresAt?.toISOString(),
      message: row.message,
    })),
    assignedTickets,
  };
}

async function getTenantView(
  scope: DashboardAnalytics["scope"],
  tenantLocation: { property?: mongoose.Types.ObjectId; unit?: mongoose.Types.ObjectId },
) {
  if (scope !== DASHBOARD_SCOPE.user || !tenantLocation.unit) {
    return { unit: null, pendingTickets: 0 };
  }

  const unit = await Unit.findById(tenantLocation.unit)
    .select("label floor bedrooms bathrooms sizeSqft monthlyRent property")
    .lean<{
      label: string;
      floor?: string;
      bedrooms?: number;
      bathrooms?: number;
      sizeSqft?: number;
      monthlyRent?: { amount?: number; currency?: string };
      property?: mongoose.Types.ObjectId;
    } | null>();
  const property = unit?.property
    ? await Property.findById(unit.property).select("name").lean<{ name?: string } | null>()
    : null;

  const tenantUnit: DashboardTenantUnit | null = unit
    ? {
        label: unit.label,
        floor: unit.floor,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sizeSqft: unit.sizeSqft,
        monthlyRent: unit.monthlyRent?.amount,
        currency: unit.monthlyRent?.currency ?? "USD",
        propertyName: property?.name,
      }
    : null;

  return {
    unit: tenantUnit,
    pendingTickets: await Ticket.countDocuments({
      unit: tenantLocation.unit,
      status: TICKET_STATUS.pending,
    }),
  };
}

async function getPortfolioStats(
  scope: DashboardAnalytics["scope"],
  workspaceFilter: Record<string, unknown>,
  tenantLocation: { property?: mongoose.Types.ObjectId; unit?: mongoose.Types.ObjectId },
) {
  const propertyFilter =
    scope === DASHBOARD_SCOPE.user && tenantLocation.property
      ? { _id: tenantLocation.property }
      : workspaceFilter;
  const unitFilter =
    scope === DASHBOARD_SCOPE.user && tenantLocation.unit
      ? { _id: tenantLocation.unit }
      : workspaceFilter;

  const [properties, unitStats] = await Promise.all([
    Property.countDocuments({ ...propertyFilter, isActive: { $ne: false } }),
    Unit.aggregate<{
      _id: null;
      units: number;
      occupiedUnits: number;
      averageRent: number | null;
    }>([
      { $match: { ...unitFilter, isActive: { $ne: false } } },
      {
        $group: {
          _id: null,
          units: { $sum: 1 },
          occupiedUnits: {
            $sum: { $cond: [{ $eq: ["$tenantActive", true] }, 1, 0] },
          },
          averageRent: { $avg: "$monthlyRent.amount" },
        },
      },
    ]),
  ]);

  const units = unitStats[0]?.units ?? 0;
  const occupiedUnits = unitStats[0]?.occupiedUnits ?? 0;

  return {
    properties,
    units,
    occupiedUnits,
    vacantUnits: Math.max(units - occupiedUnits, 0),
    occupancyRate: percent(occupiedUnits, units),
    averageRent: nullableNumber(unitStats[0]?.averageRent),
  };
}

async function getTeamStats(
  scope: DashboardAnalytics["scope"],
  businessObjectId: mongoose.Types.ObjectId,
) {
  const match =
    scope === DASHBOARD_SCOPE.platform
      ? {}
      : { "memberships.business": businessObjectId };

  const rows = await User.aggregate<{
    _id: { role: ROLES; status: INVITE_STATUS };
    count: number;
  }>([
    { $unwind: "$memberships" },
    { $match: match },
    {
      $group: {
        _id: {
          role: "$memberships.role",
          status: "$memberships.status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const active = rows
    .filter((row) => row._id.status === INVITE_STATUS.activated)
    .reduce((sum, row) => sum + row.count, 0);
  const invited = rows
    .filter((row) => row._id.status === INVITE_STATUS.invited)
    .reduce((sum, row) => sum + row.count, 0);

  return {
    total: rows.reduce((sum, row) => sum + row.count, 0),
    active,
    invited,
    technicians: roleCount(rows, ROLES.technician),
    admins: roleCount(rows, ROLES.admin) + roleCount(rows, ROLES.owner),
    tenants: roleCount(rows, ROLES.tenant),
    byRole: buildTeamRoleBreakdown(rows),
  };
}

async function getTechnicianStats(
  scope: DashboardAnalytics["scope"],
  userObjectId: mongoose.Types.ObjectId,
  businessObjectId: mongoose.Types.ObjectId,
) {
  const requestMatch = buildTechnicianRequestMatch(scope, userObjectId);
  const businessRequestMatch =
    scope === DASHBOARD_SCOPE.platform || scope === DASHBOARD_SCOPE.technician
      ? []
      : ticketBusinessLookupMatch(businessObjectId);

  const [assignedTickets, requestStats, upcomingVisits] = await Promise.all([
    scope === DASHBOARD_SCOPE.technician
      ? Ticket.countDocuments({
          assignedTo: userObjectId,
          status: { $in: DASHBOARD_OPEN_TICKET_STATUSES },
        })
      : Ticket.countDocuments({
          business: businessObjectId,
          assignedTo: { $exists: true, $ne: null },
          status: { $in: DASHBOARD_OPEN_TICKET_STATUSES },
        }),
    TechnicianRequest.aggregate<{
      _id: null;
      requestCount: number;
      selectedRequests: number;
      pendingRequests: number;
      averageQuote: number | null;
    }>([
      { $match: requestMatch },
      ...businessRequestMatch,
      {
        $group: {
          _id: null,
          requestCount: { $sum: 1 },
          selectedRequests: {
            $sum: {
              $cond: [{ $eq: ["$status", TECHNICIAN_RESPONSE.selected] }, 1, 0],
            },
          },
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ["$status", TECHNICIAN_RESPONSE.pending] }, 1, 0],
            },
          },
          averageQuote: { $avg: "$quote.total" },
        },
      },
    ]),
    TechnicianRequest.countDocuments({
      ...requestMatch,
      "schedule.date": { $gte: new Date() },
      status: TECHNICIAN_RESPONSE.selected,
    }),
  ]);

  return {
    assignedTickets,
    requestCount: requestStats[0]?.requestCount ?? 0,
    selectedRequests: requestStats[0]?.selectedRequests ?? 0,
    pendingRequests: requestStats[0]?.pendingRequests ?? 0,
    upcomingVisits,
    averageQuote: nullableNumber(requestStats[0]?.averageQuote),
  };
}

async function getTechnicianRequestBreakdown(
  scope: DashboardAnalytics["scope"],
  userObjectId: mongoose.Types.ObjectId,
  businessObjectId: mongoose.Types.ObjectId,
) {
  const requestMatch = buildTechnicianRequestMatch(scope, userObjectId);
  return TechnicianRequest.aggregate<DashboardCountRow>([
    { $match: requestMatch },
    ...(scope === DASHBOARD_SCOPE.platform || scope === DASHBOARD_SCOPE.technician
      ? []
      : ticketBusinessLookupMatch(businessObjectId)),
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
}

async function averageCompletionHours(filter: Record<string, unknown>) {
  const rows = await Ticket.aggregate<{ _id: null; averageMs: number }>([
    {
      $match: {
        ...filter,
        status: TICKET_STATUS.completed,
      },
    },
    {
      $project: {
        createdAt: 1,
        doneAt: { $ifNull: ["$completedAt", "$updatedAt"] },
      },
    },
    {
      $group: {
        _id: null,
        averageMs: { $avg: { $subtract: ["$doneAt", "$createdAt"] } },
      },
    },
  ]);

  return rows[0]?.averageMs
    ? Math.round(rows[0].averageMs / 36_000) / 100
    : null;
}

function buildTeamRoleBreakdown(
  rows: Array<{ _id: { role: ROLES; status: INVITE_STATUS }; count: number }>,
): DashboardTeamRoleBreakdown[] {
  return [
    ROLES.super_admin,
    ROLES.owner,
    ROLES.admin,
    ROLES.technician,
    ROLES.tenant,
  ]
    .map((role) => ({
      role,
      active: rows
        .filter(
          (row) =>
            row._id.role === role &&
            row._id.status === INVITE_STATUS.activated,
        )
        .reduce((sum, row) => sum + row.count, 0),
      invited: rows
        .filter(
          (row) =>
            row._id.role === role && row._id.status === INVITE_STATUS.invited,
        )
        .reduce((sum, row) => sum + row.count, 0),
    }))
    .filter((row) => row.active > 0 || row.invited > 0);
}

function toTechnicianStatusBreakdown(
  rows: DashboardCountRow[],
): DashboardTechnicianRequestBreakdown[] {
  return rows
    .filter((row): row is { _id: TECHNICIAN_RESPONSE; count: number } =>
      Boolean(row._id),
    )
    .map((row) => ({
      status: row._id,
      count: row.count,
    }));
}
