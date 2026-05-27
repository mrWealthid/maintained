"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Home,
  Link2,
  PieChart as PieChartIcon,
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
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
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
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import {
  DashboardEmptyState,
  InsightRow,
  MiniBar,
  PriorityPill,
  RequestStatusBadge,
  StatusBadge,
} from "./dashboard-primitives";

export function AdminDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <main className="flex w-full flex-col gap-3 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1800px] space-y-4 md:space-y-6">
        <HeroAndPrimaryStats data={data} />
        <SecondaryStats data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MaintenanceTrend data={data} />
          <StatusDonut data={data} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PropertyWorkload data={data} />
          <TechnicianPipeline data={data} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentTicketsTable data={data} />
          <InsightsPanel data={data} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OccupancyPanel data={data} />
          <TeamPanel data={data} />
        </div>
      </div>
    </main>
  );
}

function HeroAndPrimaryStats({ data }: { data: DashboardAnalytics }) {
  const completion = data.operations.completionRate;
  const occupancy = data.portfolio.occupancyRate;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-primary/30 bg-linear-to-br from-primary/20 via-primary/10 to-transparent">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-primary/20 p-3">
              <Wrench className="size-6 text-primary" />
            </div>
            <Badge
              variant="secondary"
              className="border-0 bg-primary/15 text-primary"
            >
              Live
            </Badge>
          </div>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {data.operations.openTickets.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Open Tickets</p>
          <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground">
              {data.operations.totalTickets.toLocaleString()} total
            </span>
            <span className="text-xs font-medium text-primary">
              {data.operations.highPriorityOpen} high priority
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Properties
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.portfolio.properties.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Building2 className="size-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">
                {data.portfolio.units} units
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-slate-400" />
              <span className="text-xs text-muted-foreground">
                {data.portfolio.vacantUnits} vacant
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Occupancy
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {occupancy}%
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <DoorOpen className="size-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {data.portfolio.occupiedUnits}/{data.portfolio.units} occupied
              </span>
              <span className="font-medium text-foreground">{occupancy}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${occupancy}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {completion}%
              </p>
            </div>
            <div className="rounded-lg bg-violet-500/10 p-2.5">
              <CheckCircle2 className="size-5 text-violet-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-violet-500" />
              <span className="text-xs text-muted-foreground">
                {data.operations.completedTickets} done
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">
                {data.operations.overdueTickets} overdue
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecondaryStats({ data }: { data: DashboardAnalytics }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-sky-500/10 p-2">
            <Clock3 className="size-4 text-sky-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">
              {data.operations.totalTickets.toLocaleString()}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Total Tickets
            </p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">All</div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-emerald-500/10 p-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">
              {data.operations.completedTickets.toLocaleString()}
            </p>
            <p className="truncate text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {data.operations.completionRate}%
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-rose-500/10 p-2">
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">
              {data.operations.overdueTickets.toLocaleString()}
            </p>
            <p className="truncate text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className="shrink-0 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            Late
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Link2 className="size-4 text-violet-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-foreground">
              {data.operations.relatedTickets.toLocaleString()}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Related Repairs
            </p>
          </div>
          <div className="text-xs text-muted-foreground">Linked</div>
        </CardContent>
      </Card>
    </div>
  );
}

function MaintenanceTrend({ data }: { data: DashboardAnalytics }) {
  const hasTrendData = data.monthlyTrend.some(
    (point) => (point.created ?? 0) > 0 || (point.completed ?? 0) > 0,
  );

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Monthly Trend"
          description="Created and completed tickets month over month."
          icon={BarChart3}
          iconWrapClassName="bg-blue-500/10"
          iconClassName="text-blue-500"
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="border-0 bg-blue-500/10 text-blue-500"
              >
                Created
              </Badge>
              <Badge
                variant="secondary"
                className="border-0 bg-emerald-500/10 text-emerald-500"
              >
                Completed
              </Badge>
            </div>
          }
        />
        {hasTrendData ? (
          <ChartContainer
            config={DASHBOARD_CHART_CONFIG}
            className="h-[240px] w-full min-w-0 sm:h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.monthlyTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="created"
                  fill="hsl(217, 91%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <DashboardEmptyState
            icon={BarChart3}
            title="No ticket trend yet"
            description="Monthly created and completed repair activity will appear here once tickets are raised."
            className="h-[240px]"
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
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Status Mix"
          description="Distribution of active tickets across workflow states."
          icon={PieChartIcon}
          iconWrapClassName="bg-violet-500/10"
          iconClassName="text-violet-500"
        />
        {hasStatusData ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ChartContainer
              config={DASHBOARD_CHART_CONFIG}
              className="h-[240px] w-full min-w-0 sm:h-[260px] sm:flex-1"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={activeStatusBreakdown}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={56}
                    outerRadius={92}
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
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex w-full flex-col gap-2 text-xs sm:w-44">
              {activeStatusBreakdown.slice(0, 6).map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        DASHBOARD_STATUS_COLORS[
                        index % DASHBOARD_STATUS_COLORS.length
                        ],
                    }}
                  />
                  <span className="truncate text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="ml-auto font-semibold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <DashboardEmptyState
            icon={PieChartIcon}
            title="No active status mix"
            description="Open ticket statuses will be charted here as maintenance work begins."
            className="h-[240px]"
          />
        )}
      </CardContent>
    </Card>
  );
}

function PropertyWorkload({ data }: { data: DashboardAnalytics }) {
  const max = Math.max(...data.propertyLoad.map((item) => item.total), 1);

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Property Workload"
          description="Open and overdue tickets grouped by property."
          icon={Building2}
          iconWrapClassName="bg-amber-500/10"
          iconClassName="text-amber-500"
        />
        {data.propertyLoad.length ? (
          <div className="overflow-x-auto">
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
                      <div className="max-w-[13rem] truncate text-foreground">
                        {property.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {property.propertyType
                          ? `${labelizeDashboardValue(property.propertyType)} · `
                          : ""}
                        {property.total} total
                      </div>
                    </TableCell>
                    <TableCell>{property.open}</TableCell>
                    <TableCell>{property.highPriority}</TableCell>
                    <TableCell>{property.overdue}</TableCell>
                    <TableCell className="w-32 pr-0">
                      <MiniBar
                        value={property.total}
                        total={max}
                        className="bg-amber-500"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <DashboardEmptyState
            icon={Building2}
            title="No property workload yet"
            description="Once properties and repair tickets exist, workload by property will fill this space."
            className="min-h-56"
          />
        )}
      </CardContent>
    </Card>
  );
}

function InsightsPanel({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Operational Insights"
          description="Signals worth attention across your portfolio."
          icon={AlertTriangle}
          iconWrapClassName="bg-rose-500/10"
          iconClassName="text-rose-500"
        />
        {data.insights.length ? (
          <div className="space-y-2">
            {data.insights.map((insight) => (
              <InsightRow key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            icon={AlertTriangle}
            title="No insights yet"
            description="Operational signals such as overdue work or stalled requests will appear here."
            className="min-h-40"
          />
        )}
      </CardContent>
    </Card>
  );
}

function OccupancyPanel({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Occupancy"
          description="Unit utilization and rent snapshot."
          icon={Home}
          iconWrapClassName="bg-emerald-500/10"
          iconClassName="text-emerald-500"
        />
        <div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.portfolio.occupancyRate}%
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {data.portfolio.occupiedUnits}/{data.portfolio.units} occupied
            </div>
          </div>
          <MiniBar
            value={data.portfolio.occupiedUnits}
            total={data.portfolio.units}
            className="mt-3 bg-emerald-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {data.portfolio.properties}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Properties
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {data.portfolio.vacantUnits}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Vacant
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {formatDashboardCurrency(data.portfolio.averageRent)}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Avg Rent
            </div>
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
      {
        label: "Admins",
        active: data.team.admins,
        invited: 0,
        total: data.team.admins,
      },
      {
        label: "Technicians",
        active: data.team.technicians,
        invited: 0,
        total: data.team.technicians,
      },
      {
        label: "Tenants",
        active: data.team.tenants,
        invited: 0,
        total: data.team.tenants,
      },
    ];

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Team"
          description="Active members and invitations across roles."
          icon={Users}
          iconWrapClassName="bg-cyan-500/10"
          iconClassName="text-cyan-500"
          actions={
            data.team.invited ? (
              <Badge
                variant="secondary"
                className="border-0 bg-amber-500/10 text-amber-600"
              >
                +{data.team.invited} invited
              </Badge>
            ) : undefined
          }
        />
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {data.team.active}
            </div>
            <div className="text-xs text-muted-foreground">Active members</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="text-lg font-bold text-foreground">
              {data.team.active}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Active
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/50 p-3">
            <div className="text-lg font-bold text-foreground">
              {data.team.invited}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Invited
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.label}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">{role.label}</span>
                <span className="font-medium text-foreground">
                  {role.total}
                  {role.invited ? (
                    <span className="ml-1 text-muted-foreground">
                      ({role.invited} invited)
                    </span>
                  ) : null}
                </span>
              </div>
              <MiniBar
                value={role.total}
                total={Math.max(data.team.total, 1)}
                className="bg-cyan-500"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TechnicianPipeline({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Technician Pipeline"
          description="Quote and inspection requests in flight."
          icon={Users}
          iconWrapClassName="bg-violet-500/10"
          iconClassName="text-violet-500"
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {data.technician.requestCount}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Requests
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {data.technician.upcomingVisits}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Visits
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-card/50 p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {formatDashboardCurrency(data.technician.averageQuote)}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Avg Quote
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {data.technician.byStatus.length ? (
            data.technician.byStatus.map((item) => (
              <div key={item.status}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <RequestStatusBadge status={item.status} />
                  <span className="font-semibold text-foreground">
                    {item.count}
                  </span>
                </div>
                <MiniBar
                  value={item.count}
                  total={Math.max(data.technician.requestCount, 1)}
                  className="bg-violet-500"
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
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Recent Tickets"
          description="Latest maintenance requests across the portfolio."
          icon={Wrench}
          iconWrapClassName="bg-primary/10"
          iconClassName="text-primary"
        />
        {data.recentTickets.length ? (
          <div className="overflow-x-auto">
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
                    <TableCell className="max-w-2xs pl-0 font-medium">
                      <div className="truncate text-foreground">
                        {ticket.title}
                      </div>
                      {ticket.assignedTo ? (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
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
                      {formatDashboardLocation(
                        ticket.propertyName,
                        ticket.unitLabel,
                      )}
                    </TableCell>
                    <TableCell className="pr-0 text-right text-muted-foreground">
                      {formatDashboardDate(ticket.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <DashboardEmptyState
            icon={Wrench}
            title="No recent tickets"
            description="The latest maintenance tickets will show here as soon as tenants or managers create them."
            className="min-h-64"
          />
        )}
      </CardContent>
    </Card>
  );
}
