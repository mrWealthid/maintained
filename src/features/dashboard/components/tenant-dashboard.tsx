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
import {
  DashboardEmptyState,
  DashboardSectionHeader,
  DashboardStatCard,
  LabelValue,
  PriorityPill,
  StatusBadge,
} from "./dashboard-primitives";

export function TenantDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardStatCard
            label="Open Repairs"
            value={data.operations.openTickets}
            icon={Wrench}
            tone="warning"
          />
          <DashboardStatCard
            label="Pending"
            value={data.tenantView.pendingTickets}
            icon={Clock3}
            tone="info"
          />
          <DashboardStatCard
            label="Resolved"
            value={data.operations.completedTickets}
            icon={CheckCircle2}
            tone="success"
            helper={`${data.operations.completionRate}% resolution`}
          />
        </div>
        <ReportRepairCard />
        <RepairHistory data={data} />
      </div>
      <div className="space-y-5">
        <UnitContext data={data} />
        <QuickHelpCard />
      </div>
    </div>
  );
}

function UnitContext({ data }: { data: DashboardAnalytics }) {
  const unit = data.tenantView.unit;

  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-3 p-4">
        <DashboardSectionHeader icon={Home} title="Unit Context" />
        {unit ? (
          <>
            <div>
              <div className="text-2xl font-semibold">{unit.label}</div>
              <div className="text-xs text-muted-foreground">
                {unit.propertyName || "Property pending"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <LabelValue label="Floor" value={unit.floor ?? "n/a"} />
              <LabelValue label="Sq Ft" value={unit.sizeSqft ?? "n/a"} />
              <LabelValue label="Beds" value={unit.bedrooms ?? "n/a"} />
              <LabelValue label="Baths" value={unit.bathrooms ?? "n/a"} />
            </div>
            <div className="rounded-md border p-2">
              <div className="text-sm font-semibold">
                {unit.monthlyRent
                  ? formatDashboardCurrency(unit.monthlyRent)
                  : "n/a"}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Monthly Rent
              </div>
            </div>
          </>
        ) : (
          <DashboardEmptyState
            icon={Home}
            title="No unit assigned"
            description="Unit, property, rent, and layout details will appear here once the tenant is linked to a unit."
            className="min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function RepairHistory({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={Wrench} title="Repair History" />
        {data.recentTickets.length ? (
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
                  <TableCell className="max-w-[18rem] pl-0 font-medium">
                    <div className="truncate">{ticket.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatDashboardLocation(ticket.propertyName, ticket.unitLabel)}
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
        ) : (
          <DashboardEmptyState
            icon={Wrench}
            title="No repair history yet"
            description="Repairs raised for this tenant will fill this space with status, priority, and creation history."
            className="mt-3 min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function ReportRepairCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="rounded-lg border-primary bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Report a repair</h2>
            <p className="mt-1 text-xs leading-5 opacity-75">
              Submit a maintenance request for your assigned unit.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-md bg-primary-foreground px-3 py-2 text-xs font-semibold text-primary transition-opacity hover:opacity-90"
          >
            <PlusCircle className="size-3.5" />
            New ticket
          </button>
        </CardContent>
      </Card>
      <CreateTicketSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

function QuickHelpCard() {
  const actions = [
    { label: "Submit a ticket", description: "Report a new repair" },
    { label: "View status", description: "Track active maintenance" },
    { label: "Contact office", description: "Reach property support" },
  ];

  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-2 p-4">
        <DashboardSectionHeader icon={Home} title="Need help?" />
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold">{action.label}</div>
              <div className="text-[10px] text-muted-foreground">
                {action.description}
              </div>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
