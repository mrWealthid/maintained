"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  PlusCircle,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDashboardLocation,
} from "../helper/dashboard-view.helper";
import CreateTicketSheet from "@/features/tickets/components/CreateTicketSheet";
import type { DashboardAnalytics } from "../models/dashboard.model";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import {
  DashboardEmptyState,
  PriorityPill,
  StatusBadge,
} from "./dashboard-primitives";

const NOT_SET = "Not set";
const UNIT_NOT_LINKED = "Unit not linked";
const PROPERTY_NOT_LINKED = "Property not linked";

function displayUnitValue(value: string | number | null | undefined) {
  return value ?? NOT_SET;
}

export function TenantDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <main className="flex w-full flex-col gap-3 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1800px] space-y-4 md:space-y-6">
        <HeroAndPrimaryStats data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RepairHistory data={data} />
          </div>
          <div className="space-y-6">
            <UnitContext data={data} />
            <QuickHelpCard />
          </div>
        </div>
      </div>
    </main>
  );
}

function HeroAndPrimaryStats({ data }: { data: DashboardAnalytics }) {
  const unit = data.tenantView.unit;
  const unitLabel = unit?.label || UNIT_NOT_LINKED;
  const propertyLabel = unit
    ? unit.propertyName || PROPERTY_NOT_LINKED
    : "Invite accepted - details pending";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <ReportRepairHero data={data} />

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Open Repairs
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.operations.openTickets.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <Wrench className="size-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span className="text-xs text-muted-foreground">
              {data.tenantView.pendingTickets} pending review
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Resolved
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.operations.completedTickets.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <CheckCircle2 className="size-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              {data.operations.completionRate}% resolution rate
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Your Unit
              </p>
              <p className="mt-1 truncate text-2xl font-bold text-foreground">
                {unitLabel}
              </p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Home className="size-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            <span className="truncate text-xs text-muted-foreground">
              {propertyLabel}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportRepairHero({ data }: { data: DashboardAnalytics }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="border-primary/30 bg-linear-to-br from-primary/20 via-primary/10 to-transparent">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-primary/20 p-3">
              <Clock3 className="size-6 text-primary" />
            </div>
            <Badge
              variant="secondary"
              className="border-0 bg-primary/15 text-primary"
            >
              Active
            </Badge>
          </div>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {data.tenantView.pendingTickets.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Pending Repairs</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <PlusCircle className="size-3.5" />
            Report a repair
          </button>
        </CardContent>
      </Card>
      <CreateTicketSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

function UnitContext({ data }: { data: DashboardAnalytics }) {
  const unit = data.tenantView.unit;

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Unit Context"
          description="Your assigned unit and lease snapshot."
          icon={Home}
          iconWrapClassName="bg-blue-500/10"
          iconClassName="text-blue-500"
        />
        {unit ? (
          <>
            <div>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {unit.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {unit.propertyName || PROPERTY_NOT_LINKED}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UnitFact label="Floor" value={displayUnitValue(unit.floor)} />
              <UnitFact label="Sq Ft" value={displayUnitValue(unit.sizeSqft)} />
              <UnitFact label="Beds" value={displayUnitValue(unit.bedrooms)} />
              <UnitFact label="Baths" value={displayUnitValue(unit.bathrooms)} />
            </div>
            <div className="rounded-lg border border-border/60 bg-card/50 p-3">
              <div className="text-lg font-bold text-foreground">
                {unit.monthlyRent != null
                  ? formatDashboardCurrency(unit.monthlyRent)
                  : NOT_SET}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                Monthly Rent
              </div>
            </div>
          </>
        ) : (
          <DashboardEmptyState
            icon={Home}
            title={UNIT_NOT_LINKED}
            description="Your invite is accepted, but this workspace does not have a unit assignment linked to your account yet."
            className="min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function UnitFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function RepairHistory({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Repair History"
          description="Maintenance requests raised for your unit."
          icon={Wrench}
          iconWrapClassName="bg-primary/10"
          iconClassName="text-primary"
        />
        {data.recentTickets.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-0">Repair</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
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
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDashboardLocation(
                          ticket.propertyName,
                          ticket.unitLabel,
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityPill priority={ticket.priority} />
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
            title="No repair history yet"
            description="Repairs raised for this tenant will fill this space with status, priority, and creation history."
            className="min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function QuickHelpCard() {
  const actions = [
    { label: "Submit a ticket", description: "Report a new repair" },
    { label: "View status", description: "Track active maintenance" },
    { label: "Contact office", description: "Reach property support" },
  ];

  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Need help?"
          description="Quick actions for your tenancy."
          icon={Home}
          iconWrapClassName="bg-emerald-500/10"
          iconClassName="text-emerald-500"
        />
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 text-left transition-colors hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-foreground">
                  {action.label}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {action.description}
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
