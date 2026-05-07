"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  Link2,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TICKET_STATUS } from "@/shared/enums/enums";
import {
  DASHBOARD_CHART_CONFIG,
  DASHBOARD_STATUS_COLORS,
} from "../helper/dashboard-view.constants";
import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDashboardLocation,
  labelizeDashboardValue,
} from "../helper/dashboard-view.helper";
import type { DashboardAnalytics } from "../models/dashboard.model";
import {
  DashboardSectionHeader,
  DashboardEmptyState,
  DashboardStatCard,
  InsightRow,
  MiniBar,
  PriorityPill,
  RequestStatusBadge,
  StatusBadge,
} from "./dashboard-primitives";

export function AdminDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <DashboardStatCard
          label="Total Tickets"
          value={data.operations.totalTickets}
          icon={Wrench}
          tone="info"
        />
        <DashboardStatCard
          label="Open Tickets"
          value={data.operations.openTickets}
          icon={Clock3}
          tone="warning"
          helper="Active work orders"
        />
        <DashboardStatCard
          label="Completed"
          value={data.operations.completedTickets}
          icon={CheckCircle2}
          tone="success"
          helper={`${data.operations.completionRate}% completion`}
        />
        <DashboardStatCard
          label="High Priority"
          value={data.operations.highPriorityOpen}
          icon={AlertTriangle}
          tone="critical"
          helper="Unresolved urgent"
        />
        <DashboardStatCard
          label="Related Repairs"
          value={data.operations.relatedTickets}
          icon={Link2}
        />
        <DashboardStatCard
          label="Overdue"
          value={data.operations.overdueTickets}
          icon={Clock3}
          tone="critical"
          helper="Past due date"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <MaintenanceTrend data={data} />
          <PropertyWorkload data={data} />
          <RecentTicketsTable data={data} />
        </div>
        <div className="space-y-5">
          <InsightsPanel data={data} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <OccupancyPanel data={data} />
            <StatusDonut data={data} />
            <TeamPanel data={data} />
            <TechnicianPipeline data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceTrend({ data }: { data: DashboardAnalytics }) {
  const hasTrendData = data.monthlyTrend.some(
    (point) => (point.created ?? 0) > 0 || (point.completed ?? 0) > 0,
  );

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={BarChart3} title="Monthly Trend" />
        {hasTrendData ? (
          <ChartContainer config={DASHBOARD_CHART_CONFIG} className="mt-3 h-52 w-full">
            <BarChart data={data.monthlyTrend} margin={{ left: 4, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="created" fill="var(--color-created)" radius={3} />
              <Bar dataKey="completed" fill="var(--color-completed)" radius={3} />
            </BarChart>
          </ChartContainer>
        ) : (
          <DashboardEmptyState
            icon={BarChart3}
            title="No ticket trend yet"
            description="Monthly created and completed repair activity will appear here once tickets are raised."
            className="mt-3 h-52"
          />
        )}
      </CardContent>
    </Card>
  );
}

function StatusDonut({ data }: { data: DashboardAnalytics }) {
  const activeStatusBreakdown = data.statusBreakdown.filter(
    (item) =>
      item.value > 0 &&
      item.label !== labelizeDashboardValue(TICKET_STATUS.completed) &&
      item.label !== labelizeDashboardValue(TICKET_STATUS.declined),
  );
  const hasStatusData = activeStatusBreakdown.some((item) => item.value > 0);

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={Clock3} title="Status Mix" />
        {hasStatusData ? (
          <>
            <ChartContainer config={DASHBOARD_CHART_CONFIG} className="mt-3 h-48 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={activeStatusBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={46}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {activeStatusBreakdown.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        DASHBOARD_STATUS_COLORS[
                          index % DASHBOARD_STATUS_COLORS.length
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
              {activeStatusBreakdown.slice(0, 6).map((item, index) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-sm"
                    style={{
                      backgroundColor:
                        DASHBOARD_STATUS_COLORS[index % DASHBOARD_STATUS_COLORS.length],
                    }}
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
                  <span className="ml-auto font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <DashboardEmptyState
            icon={Clock3}
            title="No active status mix"
            description="Open ticket statuses will be charted here as maintenance work begins."
            className="mt-3 h-48"
          />
        )}
      </CardContent>
    </Card>
  );
}

function PropertyWorkload({ data }: { data: DashboardAnalytics }) {
  const max = Math.max(...data.propertyLoad.map((item) => item.total), 1);

  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={Building2} title="Property Workload" />
        {data.propertyLoad.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Property</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>High</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead className="pr-0">Load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.propertyLoad.map((property) => (
                <TableRow key={property.propertyId ?? property.name}>
                  <TableCell className="pl-0 font-medium">
                    <div className="max-w-[13rem] truncate">{property.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {property.propertyType
                        ? `${labelizeDashboardValue(property.propertyType)} · `
                        : ""}
                      {property.total} total tickets
                    </div>
                  </TableCell>
                  <TableCell>{property.open}</TableCell>
                  <TableCell>{property.highPriority}</TableCell>
                  <TableCell>{property.overdue}</TableCell>
                  <TableCell className="w-32 pr-0">
                    <MiniBar value={property.total} total={max} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <DashboardEmptyState
            icon={Building2}
            title="No property workload yet"
            description="Once properties and repair tickets exist, workload by property will fill this space."
            className="mt-3 min-h-56"
          />
        )}
      </CardContent>
    </Card>
  );
}

function InsightsPanel({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-2 p-4">
        <DashboardSectionHeader icon={AlertTriangle} title="Operational Insights" />
        {data.insights.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}
      </CardContent>
    </Card>
  );
}

function OccupancyPanel({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-3 p-4">
        <DashboardSectionHeader icon={Home} title="Occupancy" />
        <div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-semibold">
              {data.portfolio.occupancyRate}%
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {data.portfolio.occupiedUnits}/{data.portfolio.units} occupied
            </div>
          </div>
          <MiniBar
            value={data.portfolio.occupiedUnits}
            total={data.portfolio.units}
            className="mt-3 bg-emerald-600"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border p-2">
            <div className="font-semibold">{data.portfolio.properties}</div>
            <div className="text-muted-foreground">Properties</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="font-semibold">{data.portfolio.vacantUnits}</div>
            <div className="text-muted-foreground">Vacant</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="font-semibold">
              {formatDashboardCurrency(data.portfolio.averageRent)}
            </div>
            <div className="text-muted-foreground">Avg Rent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamPanel({ data }: { data: DashboardAnalytics }) {
  const roles = data.team.byRole.length
    ? data.team.byRole.map((role) => ({
        label: labelizeDashboardValue(role.role),
        active: role.active,
        invited: role.invited,
        total: role.active + role.invited,
      }))
    : [
        { label: "Admins", active: data.team.admins, invited: 0, total: data.team.admins },
        {
          label: "Technicians",
          active: data.team.technicians,
          invited: 0,
          total: data.team.technicians,
        },
        { label: "Tenants", active: data.team.tenants, invited: 0, total: data.team.tenants },
      ];

  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-3 p-4">
        <DashboardSectionHeader icon={Users} title="Team" />
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-semibold">{data.team.active}</div>
            <div className="text-xs text-muted-foreground">Active members</div>
          </div>
          {data.team.invited ? (
            <div className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              +{data.team.invited} invited
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border p-2">
            <div className="text-lg font-semibold">{data.team.active}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Active
            </div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-lg font-semibold">{data.team.invited}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Invited
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{role.label}</span>
                <span className="font-medium">
                  {role.total}
                  {role.invited ? (
                    <span className="ml-1 text-muted-foreground">
                      ({role.invited} invited)
                    </span>
                  ) : null}
                </span>
              </div>
              <MiniBar value={role.total} total={Math.max(data.team.total, 1)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TechnicianPipeline({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-3 p-4">
        <DashboardSectionHeader icon={Users} title="Technician Pipeline" />
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border p-2">
            <div className="font-semibold">{data.technician.requestCount}</div>
            <div className="text-muted-foreground">Requests</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="font-semibold">{data.technician.upcomingVisits}</div>
            <div className="text-muted-foreground">Visits</div>
          </div>
          <div className="rounded-md border p-2">
            <div className="font-semibold">
              {formatDashboardCurrency(data.technician.averageQuote)}
            </div>
            <div className="text-muted-foreground">Avg Quote</div>
          </div>
        </div>
        <div className="space-y-2">
          {data.technician.byStatus.length ? (
            data.technician.byStatus.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex justify-between text-xs">
                  <RequestStatusBadge status={item.status} />
                  <span className="font-medium">{item.count}</span>
                </div>
                <MiniBar
                  value={item.count}
                  total={Math.max(data.technician.requestCount, 1)}
                />
              </div>
            ))
          ) : (
            <DashboardEmptyState
              icon={Users}
              title="No technician requests"
              description="Quote and inspection requests will be grouped here when tickets need external support."
              className="min-h-36 py-6"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentTicketsTable({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={Wrench} title="Recent Tickets" />
        {data.recentTickets.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-0">Ticket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="pr-0 text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="max-w-[18rem] pl-0 font-medium">
                    <div className="truncate">{ticket.title}</div>
                    {ticket.assignedTo ? (
                      <div className="text-[11px] text-muted-foreground">
                        Assigned to {ticket.assignedTo}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityPill priority={ticket.priority} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDashboardLocation(ticket.propertyName, ticket.unitLabel)}
                  </TableCell>
                  <TableCell className="pr-0 text-right text-muted-foreground">
                    {formatDashboardDate(ticket.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <DashboardEmptyState
            icon={Wrench}
            title="No recent tickets"
            description="The latest maintenance tickets will show here as soon as tenants or managers create them."
            className="mt-3 min-h-64"
          />
        )}
      </CardContent>
    </Card>
  );
}
