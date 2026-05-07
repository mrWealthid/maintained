"use client";

import {
  CalendarDays,
  ClipboardList,
  DollarSign,
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
import type { DashboardAnalytics } from "../models/dashboard.model";
import {
  DashboardEmptyState,
  DashboardSectionHeader,
  DashboardStatCard,
  PriorityPill,
  RequestStatusBadge,
  StatusBadge,
} from "./dashboard-primitives";

export function TechnicianDashboard({ data }: { data: DashboardAnalytics }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          label="Assigned"
          value={data.technician.assignedTickets}
          icon={Wrench}
          tone="info"
          helper="Open work orders"
        />
        <DashboardStatCard
          label="Scheduled"
          value={data.technician.upcomingVisits}
          icon={CalendarDays}
          tone="success"
          helper="Upcoming visits"
        />
        <DashboardStatCard
          label="Pending Quotes"
          value={data.technician.pendingRequests}
          icon={ClipboardList}
          tone="warning"
          helper="Awaiting response"
        />
        <DashboardStatCard
          label="Avg Quote"
          value={formatDashboardCurrency(data.technician.averageQuote)}
          icon={DollarSign}
          helper="Submitted estimates"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <AssignedTickets data={data} />
          <Schedule data={data} />
        </div>
        <QuoteRequests data={data} />
      </div>
    </div>
  );
}

function AssignedTickets({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={Wrench} title="Assigned Tickets" />
        {data.technicianView.assignedTickets.length ? (
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
                  <TableCell className="max-w-[18rem] pl-0 font-medium">
                    <div className="truncate">{ticket.title}</div>
                    {ticket.area ? (
                      <div className="text-[11px] text-muted-foreground">
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
                    {formatDashboardLocation(ticket.propertyName, ticket.unitLabel)}
                  </TableCell>
                  <TableCell className="pr-0 text-right text-muted-foreground">
                    {ticket.dueDate ? formatDashboardDate(ticket.dueDate) : "n/a"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <DashboardEmptyState
            icon={Wrench}
            title="No assigned tickets"
            description="Assigned maintenance work will appear here with status, priority, location, and due dates."
            className="mt-3 min-h-72"
          />
        )}
      </CardContent>
    </Card>
  );
}

function Schedule({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="space-y-2 p-4">
        <DashboardSectionHeader icon={CalendarDays} title="Schedule" />
        {data.technicianView.schedule.map((entry) => (
          <div
            key={entry.id}
            className="rounded-md border border-l-4 border-l-primary p-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">
                  {entry.ticketTitle}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDashboardLocation(entry.propertyName, entry.unitLabel)}
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
        {!data.technicianView.schedule.length ? (
          <DashboardEmptyState
            icon={CalendarDays}
            title="No scheduled visits"
            description="Upcoming appointments and inspection windows will fill this schedule once work is booked."
            className="min-h-56"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuoteRequests({ data }: { data: DashboardAnalytics }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-4">
        <DashboardSectionHeader icon={DollarSign} title="Quote Requests" />
        <div className="mt-3 space-y-3">
          {data.technicianView.quoteRequests.map((request) => (
            <div key={request.id} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
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
                <span className="font-semibold">
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
          {!data.technicianView.quoteRequests.length ? (
            <DashboardEmptyState
              icon={DollarSign}
              title="No quote requests"
              description="New quote and inspection requests will appear here when managers request technician support."
              className="min-h-80"
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
