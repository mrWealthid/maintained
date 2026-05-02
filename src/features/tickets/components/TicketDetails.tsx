"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock,
  FileText,
  ImageIcon,
  MoreHorizontal,
  User,
  VideoIcon,
} from "lucide-react";
import Image from "next/image";
import { ManageTicketDetailsProps } from "../models/ticket.model";
import {
  TECHNICIAN_RESPONSE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
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
} from "../hooks/ticketHooks";
import SendTechnicianRequestForm from "@/features/technician-requests/forms/SendTechnicianRequestForm";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { Loader2, Send, UserPlus, X as XIcon } from "lucide-react";

const getPriorityColor = (priority: TICKET_PRIORITY | undefined) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusColor = (status: TICKET_STATUS | undefined) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "default";
    case "in-progress":
      return "secondary";
    case "resolved":
      return "outline";
    case "closed":
      return "secondary";
    default:
      return "outline";
  }
};

export default function TicketDetails({ ticket }: ManageTicketDetailsProps) {
  const { isAssigning, handleAssignTechnician } = useAssignTechnician(
    ticket?.id!
  );
  const canAssignTicket = useHasPermission(PERMISSION.TICKETS_ASSIGN);
  const canCreateTechnicianRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE
  );
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE
  );
  const hasHeaderActions = canAssignTicket || canCreateTechnicianRequest;
  const hasTechnicianResponseActions =
    canAssignTicket || canManageTicketStatus;

  const { user } = useAppContext();
  const { isUpdating: isAssigningSelf, handleAssignTicket } = useAssignTicket(
    ticket?.id!,
  );
  const { isProcessing, processResponse } = useProcessTechnicianResponse(
    ticket?.id!,
  );

  type ConfirmKey =
    | "assign-technician"
    | "assign-to-me"
    | "withdraw"
    | "decline-technician";

  type ConfirmConfigItem = {
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "default" | "destructive";
    icon?: React.ComponentType<{ className?: string }>;
    onConfirm: () => Promise<void> | void;
  };

  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);
  const [targetRequestId, setTargetRequestId] = useState<string | null>(null);
  const [sendRequestOpen, setSendRequestOpen] = useState(false);
  const [scheduleRequestId, setScheduleRequestId] = useState<string | null>(
    null,
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  const closeConfirm = () => {
    setConfirmKey(null);
    setTargetRequestId(null);
  };

  const isLoading = isAssigning || isAssigningSelf || isProcessing;

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
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
      title: "Assign to Me",
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
          },
          { onSuccess: () => closeConfirm() } as any,
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
      },
      {
        onSuccess: () => {
          setScheduleRequestId(null);
          setScheduleDate("");
          setScheduleStart("");
          setScheduleEnd("");
        },
      } as any,
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-background min-h-screen">
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-card-foreground">
              {ticket?.title || "Ticket Details"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Created on{" "}
              {ticket?.createdAt
                ? new Date(ticket.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
          {hasHeaderActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <MoreHorizontal className="h-4 w-4" />
                  Actions
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* <DropdownMenuItem>
                <Link href={`${ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${}`}>
                  View Details
                </Link>
              </DropdownMenuItem> */}
                {canAssignTicket && (
                  <DropdownMenuItem
                    onSelect={() => setConfirmKey("assign-to-me")}
                  >
                    Assign to me
                  </DropdownMenuItem>
                )}
                {canCreateTechnicianRequest && (
                  <DropdownMenuItem
                    onSelect={() => setSendRequestOpen(true)}
                  >
                    Assign Technician
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Ticket Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={getStatusColor(ticket?.status)}
                    className="text-sm"
                  >
                    {ticket?.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Priority
                  </p>
                  <Badge
                    variant={getPriorityColor(ticket?.priority)}
                    className="text-sm"
                  >
                    {ticket?.priority}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium text-card-foreground">
                  Description
                </h3>
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-foreground leading-relaxed">
                    {ticket?.description}
                  </p>
                </div>
              </div>

              {Array.isArray(ticket?.images) && ticket.images.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-card-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Attached Images ({ticket.images.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ticket.images.map((image, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-lg border border-border bg-card"
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Ticket image ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-cover w-full h-48"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(ticket?.videos) && ticket.videos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-card-foreground flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" />
                    Attached Videos ({ticket.videos.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ticket.videos.map((vid, index) => (
                      <video
                        key={index}
                        controls
                        className="rounded-lg border border-border w-full h-48 object-cover"
                        src={vid}
                        aria-label={`Video ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
                  </p>
                  <p className="text-card-foreground">{ticket?.user.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-card-foreground">{ticket?.user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-card-foreground">(123) 456-7890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {Array.isArray(ticket?.requests) && ticket.requests.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Technician Responses ({ticket.requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticket.requests.map((request, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-6 bg-muted/50"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-card-foreground">
                        {request.technician.name}
                      </h4>
                      <Badge variant={"outline"} className="mt-1 text-xs">
                        {request.status === TECHNICIAN_RESPONSE.applied && (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {request.status === TECHNICIAN_RESPONSE.pending && (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={"outline"} className="mt-1 text-xs">
                      {ticket.status}
                    </Badge>
                    {hasTechnicianResponseActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="">
                          {canAssignTicket && (
                            <DropdownMenuItem
                              onSelect={() => {
                                setTargetRequestId(request.technician.id);
                                setConfirmKey("assign-technician");
                              }}
                            >
                              Assign
                            </DropdownMenuItem>
                          )}

                          {canManageTicketStatus && (
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
                                Update Schedule
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
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {request.quote.cost.length > 0 && (
                  <div className="bg-background rounded-lg p-4 mb-4 border">
                    <h5 className="font-medium text-card-foreground mb-3">
                      Cost Breakdown
                    </h5>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">
                            Amount (₦)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {request.quote.cost.map((item, index) => (
                          <TableRow key={index}>
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
                )}
                {request.schedule && (
                  <div className="bg-background border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Scheduled Repair</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
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
                )}

                {/* {request.status === TECHNICIAN_RESPONSE.pending && (
                  <div className="flex gap-3 pt-2">
                    <Button size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                )} */}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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

      {ticket ? (
        <SendTechnicianRequestForm
          ticket={ticket as any}
          open={sendRequestOpen}
          onOpenChange={setSendRequestOpen}
        />
      ) : null}

      <Dialog
        open={!!scheduleRequestId}
        onOpenChange={(o) => !o && setScheduleRequestId(null)}
      >
        <AppDialogContent>
          <form
            onSubmit={handleSubmitSchedule}
            className="flex min-h-0 flex-1 flex-col"
          >
            <AppDialogHeader
              title="Update Schedule"
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
                {isProcessing && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Save schedule
              </Button>
            </AppDialogFooter>
          </form>
        </AppDialogContent>
      </Dialog>
    </div>
  );
}
