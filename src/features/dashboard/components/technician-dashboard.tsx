"use client";

import {
  CalendarDays,
  ClipboardList,
  DollarSign,
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
import type { DashboardAnalytics } from "../models/dashboard.model";
import { DashboardSectionHeader } from "./DashboardSectionHeader";
import {
  DashboardEmptyState,
  PriorityPill,
  RequestStatusBadge,
  StatusBadge,
} from "./dashboard-primitives";

export function TechnicianDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <main className="flex w-full flex-col gap-3 overflow-x-hidden">
      <div className="mx-auto w-full max-w-[1800px] space-y-4 md:space-y-6">
        <HeroAndPrimaryStats data={data} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AssignedTickets data={data} />
          <Schedule data={data} />
        </div>

        <QuoteRequests data={data} />
      </div>
    </main>
  );
}

function HeroAndPrimaryStats({ data }: { data: DashboardAnalytics }) {
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
              On Deck
            </Badge>
          </div>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {data.technician.assignedTickets.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Assigned Tickets</p>
          <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
            <span className="text-xs text-muted-foreground">
              {data.technician.upcomingVisits} upcoming
            </span>
            <span className="text-xs font-medium text-primary">
              {data.technician.pendingRequests} pending quotes
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Scheduled
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.technician.upcomingVisits.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <CalendarDays className="size-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Upcoming visits</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card transition-colors hover:border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Quotes
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.technician.pendingRequests.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-2.5">
              <ClipboardList className="size-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">
                {data.technician.requestCount} total
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                {data.technician.selectedRequests} selected
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
                Avg Quote
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatDashboardCurrency(data.technician.averageQuote)}
              </p>
            </div>
            <div className="rounded-lg bg-violet-500/10 p-2.5">
              <DollarSign className="size-5 text-violet-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-violet-500" />
            <span className="text-xs text-muted-foreground">
              Submitted estimates
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignedTickets({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Assigned Tickets"
          description="Open work orders currently routed to you."
          icon={Wrench}
          iconWrapClassName="bg-primary/10"
          iconClassName="text-primary"
        />
        {data.technicianView.assignedTickets.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-0">Ticket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="pr-0 text-right">Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.technicianView.assignedTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="max-w-2xs pl-0 font-medium">
                      <div className="truncate text-foreground">
                        {ticket.title}
                      </div>
                      {ticket.area ? (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {ticket.area}
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
                      {ticket.dueDate
                        ? formatDashboardDate(ticket.dueDate)
                        : "n/a"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <DashboardEmptyState
            icon={Wrench}
            title="No assigned tickets"
            description="Assigned maintenance work will appear here with status, priority, location, and due dates."
            className="min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function Schedule({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Schedule"
          description="Upcoming appointments and inspection windows."
          icon={CalendarDays}
          iconWrapClassName="bg-emerald-500/10"
          iconClassName="text-emerald-500"
        />
        {data.technicianView.schedule.length ? (
          <div className="space-y-2">
            {data.technicianView.schedule.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border/60 border-l-4 border-l-primary bg-card/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.ticketTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatDashboardLocation(
                        entry.propertyName,
                        entry.unitLabel,
                      )}
                    </p>
                  </div>
                  <PriorityPill priority={entry.priority} />
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {entry.date ? formatDashboardDate(entry.date) : "Date pending"}
                  {entry.startTime ? `, ${entry.startTime}` : ""}
                  {entry.endTime ? ` - ${entry.endTime}` : ""}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            icon={CalendarDays}
            title="No scheduled visits"
            description="Upcoming appointments and inspection windows will fill this schedule once work is booked."
            className="min-h-56"
          />
        )}
      </CardContent>
    </Card>
  );
}

function QuoteRequests({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="min-w-0 border-border bg-card">
      <CardContent className="space-y-4 p-5">
        <DashboardSectionHeader
          title="Quote Requests"
          description="Estimate and inspection requests awaiting your response."
          icon={DollarSign}
          iconWrapClassName="bg-violet-500/10"
          iconClassName="text-violet-500"
        />
        {data.technicianView.quoteRequests.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.technicianView.quoteRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-border/60 bg-card/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {request.ticketTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {request.propertyName || "Property pending"}
                    </p>
                  </div>
                  <RequestStatusBadge status={request.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Quote</span>
                  <span className="font-semibold text-foreground">
                    {request.quoteTotal
                      ? formatDashboardCurrency(request.quoteTotal)
                      : "Not submitted"}
                  </span>
                </div>
                {request.expiresAt ? (
                  <div className="mt-1.5 text-[11px] text-muted-foreground">
                    Expires {formatDashboardDate(request.expiresAt)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            icon={DollarSign}
            title="No quote requests"
            description="New quote and inspection requests will appear here when managers request technician support."
            className="min-h-56"
          />
        )}
      </CardContent>
    </Card>
  );
}
