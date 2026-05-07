"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  Loader2,
  MoreHorizontal,
  Send,
  User as UserIcon,
  UserPlus,
  Wrench,
  X as XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import {
  AppDialogBody,
  AppDialogContent,
  AppDialogFooter,
  AppDialogHeader,
} from "@/shared/components/AppDialogShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useAssignTechnician,
  useAssignTicket,
  useProcessTechnicianResponse,
} from "@/features/tickets/hooks/ticketHooks";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import {
  TECHNICIAN_RESPONSE,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import SendTechnicianRequestForm from "@/features/technician-requests/forms/SendTechnicianRequestForm";

type ConfirmKey =
  | "assign-technician"
  | "assign-to-me"
  | "withdraw"
  | "decline-technician";

type TechnicianRequest = {
  id: string;
  status: string;
  technician: { id: string; name?: string; email?: string };
  quote: { total: number; cost: { title: string; amount: number }[] };
  schedule?: { date: string; start: string; end: string } | null;
};

type Ticket = {
  id: string;
  status?: string;
  requests?: TechnicianRequest[];
};

type Props = {
  ticket: Ticket;
};

export default function TicketTechnicianResponsesPanel({ ticket }: Props) {
  const { user } = useAppContext();

  const canAssignTicket = useHasPermission(PERMISSION.TICKETS_ASSIGN);
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE,
  );
  const canCreateTechnicianRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE,
  );
  const hasTechnicianResponseActions = canAssignTicket || canManageTicketStatus;

  const { isAssigning, handleAssignTechnician } = useAssignTechnician(ticket.id);
  const { isUpdating: isAssigningSelf, handleAssignTicket } = useAssignTicket(
    ticket.id,
  );
  const { isProcessing, processResponse } = useProcessTechnicianResponse(
    ticket.id,
  );

  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);
  const [targetRequestId, setTargetRequestId] = useState<string | null>(null);
  const [sendRequestOpen, setSendRequestOpen] = useState(false);
  const [scheduleRequestId, setScheduleRequestId] = useState<string | null>(
    null,
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  const requests = ticket.requests ?? [];
  const isLoading = isAssigning || isAssigningSelf || isProcessing;

  const closeConfirm = () => {
    setConfirmKey(null);
    setTargetRequestId(null);
  };

  const confirmConfig: Record<
    ConfirmKey,
    {
      title: string;
      description: string;
      confirmLabel: string;
      variant?: "default" | "destructive";
      icon: React.ComponentType<{ className?: string }>;
      onConfirm: () => void;
    }
  > = {
    "assign-technician": {
      title: "Assign Technician",
      description: "Are you sure you want to assign this ticket?",
      confirmLabel: isAssigning ? "Assigning..." : "Assign",
      icon: ClipboardCheck,
      onConfirm: () => {
        if (!targetRequestId) return;
        handleAssignTechnician(
          { assignedTo: targetRequestId },
          { onSuccess: () => closeConfirm() },
        );
      },
    },
    "assign-to-me": {
      title: "Assign to me",
      description: "The ticket will be actioned by you.",
      confirmLabel: isAssigningSelf ? "Assigning..." : "Assign to me",
      icon: UserPlus,
      onConfirm: () => {
        handleAssignTicket(
          { actionedBy: user?.id, status: TICKET_STATUS.processing },
          { onSuccess: () => closeConfirm() },
        );
      },
    },
    withdraw: {
      title: "Withdraw Assignment",
      description: "The ticket will revert to pending.",
      confirmLabel: isAssigningSelf ? "Withdrawing..." : "Withdraw",
      icon: XIcon,
      variant: "destructive",
      onConfirm: () => {
        handleAssignTicket(
          { actionedBy: undefined, status: TICKET_STATUS.pending },
          { onSuccess: () => closeConfirm() },
        );
      },
    },
    "decline-technician": {
      title: "Decline Technician Response",
      description: "The technician's response will be marked declined.",
      confirmLabel: isProcessing ? "Declining..." : "Decline",
      icon: XIcon,
      variant: "destructive",
      onConfirm: () => {
        if (!targetRequestId) return;
        processResponse(
          {
            status: TECHNICIAN_RESPONSE.declined,
            message: targetRequestId,
          } as never,
          { onSuccess: () => closeConfirm() } as never,
        );
      },
    },
  };

  const activeConfirm = confirmKey ? confirmConfig[confirmKey] : null;

  function handleSubmitSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduleRequestId || !scheduleDate || !scheduleStart || !scheduleEnd)
      return;
    processResponse(
      {
        status: TECHNICIAN_RESPONSE.selected,
        schedule: {
          day: scheduleDate,
          start: `${scheduleDate}T${scheduleStart}`,
          end: `${scheduleDate}T${scheduleEnd}`,
        },
        message: scheduleRequestId,
      } as never,
      {
        onSuccess: () => {
          setScheduleRequestId(null);
          setScheduleDate("");
          setScheduleStart("");
          setScheduleEnd("");
        },
      } as never,
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            Technician responses
            <Badge variant="outline" className="ml-1 font-mono text-xs">
              {requests.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {canAssignTicket ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmKey("assign-to-me")}
                disabled={isAssigningSelf}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Assign to me
              </Button>
            ) : null}
            {canCreateTechnicianRequest ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setSendRequestOpen(true)}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Send to technician
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!requests.length ? (
            <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
              <Wrench
                className="mx-auto h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-medium">
                No technician requests yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {canCreateTechnicianRequest
                  ? "Send this ticket to a technician to start collecting quotes."
                  : "A workspace admin will route this ticket to a technician."}
              </p>
            </div>
          ) : null}
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border bg-muted/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {request.technician?.name ?? "Technician"}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {request.status === TECHNICIAN_RESPONSE.applied ? (
                        <Check className="mr-1 h-3 w-3" aria-hidden="true" />
                      ) : request.status === TECHNICIAN_RESPONSE.pending ? (
                        <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                      ) : null}
                      {request.status}
                    </Badge>
                  </div>
                </div>
                {hasTechnicianResponseActions ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canAssignTicket ? (
                        <DropdownMenuItem
                          onSelect={() => {
                            setTargetRequestId(request.technician.id);
                            setConfirmKey("assign-technician");
                          }}
                        >
                          Assign
                        </DropdownMenuItem>
                      ) : null}
                      {canManageTicketStatus ? (
                        <>
                          <DropdownMenuItem
                            onSelect={() => setConfirmKey("withdraw")}
                          >
                            Withdraw
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              setScheduleRequestId(request.id)
                            }
                          >
                            Update schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setTargetRequestId(request.id);
                              setConfirmKey("decline-technician");
                            }}
                          >
                            Decline
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>

              {request.quote?.cost?.length ? (
                <div className="mt-4 rounded-lg border bg-background p-4">
                  <h4 className="mb-2 text-sm font-medium">Cost breakdown</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Amount (₦)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {request.quote.cost.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="capitalize">
                            {item.title}
                          </TableCell>
                          <TableCell className="text-right">
                            ₦{Number(item.amount || 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right font-medium">
                          ₦{request.quote.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {request.schedule ? (
                <div className="mt-4 rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Scheduled repair
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(request.schedule.date).toDateString()} from{" "}
                    {new Date(request.schedule.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    to{" "}
                    {new Date(request.schedule.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <SendTechnicianRequestForm
        ticket={ticket as never}
        open={sendRequestOpen}
        onOpenChange={setSendRequestOpen}
      />

      {activeConfirm ? (
        <ActionConfirmDialog
          open={!!activeConfirm}
          onOpenChange={(o) => !o && closeConfirm()}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          variant={activeConfirm.variant}
          icon={activeConfirm.icon}
          isLoading={isLoading}
          onConfirm={async () => {
            await activeConfirm.onConfirm();
          }}
        />
      ) : null}

      <Dialog
        open={!!scheduleRequestId}
        onOpenChange={(o) => !o && setScheduleRequestId(null)}
      >
        <AppDialogContent>
          <form onSubmit={handleSubmitSchedule} className="flex min-h-0 flex-1 flex-col">
            <AppDialogHeader
              title="Update schedule"
              description="Set the date and time window for the technician visit."
              icon={Calendar}
            />
            <AppDialogBody>
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date</Label>
                <Input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="schedule-start">Start</Label>
                  <Input
                    id="schedule-start"
                    type="time"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-end">End</Label>
                  <Input
                    id="schedule-end"
                    type="time"
                    value={scheduleEnd}
                    onChange={(e) => setScheduleEnd(e.target.value)}
                    required
                  />
                </div>
              </div>
            </AppDialogBody>
            <AppDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleRequestId(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Save schedule
              </Button>
            </AppDialogFooter>
          </form>
        </AppDialogContent>
      </Dialog>
    </>
  );
}
