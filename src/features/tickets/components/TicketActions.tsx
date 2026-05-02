"use client";

import { useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  Send,
  UserPlus,
  Repeat,
  Trash2,
  ClipboardCheck,
  Wrench,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import ErrorList from "@/components/ui/ErrorList";

import { TICKET_STATUS } from "@/shared/enums/enums";
import { useAppContext } from "@/shared/contexts/AppContext";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import type { BaseActions, ConfirmActions } from "@/shared/model/model";
import type { CreateTicketPayload } from "@/shared/model/model";

import {
  ManageTicketForm,
  TicketRowActionsProps,
} from "../models/ticket.model";
import {
  useAssignTicket,
  useCreateTicket,
  useDeleteTicket,
} from "../hooks/ticketHooks";
import TicketForm from "../forms/TicketForm";
import TicketSummary from "./TicketSummary";
import HandOffTicketForm from "../forms/HandOffTicketForm";
import SendTechnicianRequestForm from "@/features/technician-requests/forms/SendTechnicianRequestForm";

type ConfirmKey = "self-assign" | "delete";

type ConfirmConfigItem = {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  icon?: ComponentType<{ className?: string }>;
  onConfirm: () => Promise<void> | void;
};

export const TicketActions = ({ ticket }: TicketRowActionsProps) => {
  const router = useRouter();
  const { user } = useAppContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [sendRequestOpen, setSendRequestOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);

  const { isDeleting, handleDeleteTicket, deleteTicketError } =
    useDeleteTicket();
  const { isUpdating, handleAssignTicket, assignTicketError } =
    useAssignTicket(ticket.id);
  const { handleCreateTicket, createTicketError } = useCreateTicket(
    true,
    ticket.id,
  );

  const canEditTicket = useHasPermission(PERMISSION.TICKETS_EDIT);
  const canAssignTicket = useHasPermission(PERMISSION.TICKETS_ASSIGN);
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE,
  );
  const canDeleteTicket = useHasPermission(PERMISSION.TICKETS_DELETE);
  const canCreateTechnicianRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE,
  );

  const isActionedByCurrentUser = user?.id === ticket.actionedBy?.id;
  const isLoading = isDeleting || isUpdating;

  const methods = useForm<ManageTicketForm>({
    mode: "all",
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      area: ticket.area,
      type: ticket.type,
      category:
        typeof ticket.category === "object"
          ? ticket.category.id
          : ticket.category,
      images: undefined,
      videos: undefined,
    },
  });

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void; onError: () => void },
  ) => {
    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setEditOpen(false);
      },
    });
  };

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
    "self-assign": {
      title: "Admin Assignment",
      description: "Are you sure you want to assign this ticket to yourself?",
      confirmLabel: isUpdating ? "Assigning..." : "Assign to me",
      icon: ClipboardCheck,
      onConfirm: () => {
        handleAssignTicket(
          { actionedBy: user?.id, status: TICKET_STATUS.processing },
          { onSuccess: () => setConfirmKey(null) },
        );
      },
    },
    delete: {
      title: "Delete Maintenance Ticket",
      description:
        "This action cannot be undone. The ticket will be permanently removed.",
      confirmLabel: isDeleting ? "Deleting..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: () => {
        handleDeleteTicket(ticket.id, {
          onSuccess: () => setConfirmKey(null),
        });
      },
    },
  };

  const activeConfirm = confirmKey ? confirmConfig[confirmKey] : null;

  const baseActions: BaseActions[] = [
    {
      label: "View details",
      action: () =>
        router.push(`${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/${ticket.id}`),
      icon: Eye,
    },
  ];

  if (ticket.status === TICKET_STATUS.pending && canEditTicket) {
    baseActions.push({
      label: "Edit",
      action: () => {
        setMenuOpen(false);
        setEditOpen(true);
      },
      icon: Edit,
    });
  }

  if (
    ticket.status !== TICKET_STATUS.pending &&
    (canManageTicketStatus ||
      (canAssignTicket && isActionedByCurrentUser))
  ) {
    baseActions.push({
      label: "Handoff",
      action: () => {
        setMenuOpen(false);
        setHandoffOpen(true);
      },
      icon: Repeat,
    });
  }

  if (
    ticket.status === TICKET_STATUS.processing &&
    canCreateTechnicianRequest &&
    (isActionedByCurrentUser || canAssignTicket)
  ) {
    baseActions.push({
      label: "Assign",
      action: () => {
        setMenuOpen(false);
        setSendRequestOpen(true);
      },
      icon: Send,
    });
  }

  if (
    ticket.status === TICKET_STATUS.pending_assignment &&
    canCreateTechnicianRequest
  ) {
    baseActions.push({
      label: "Update assignment",
      action: () => {
        setMenuOpen(false);
        setSendRequestOpen(true);
      },
      icon: Send,
    });
  }

  const confirmableActions: Array<
    Omit<ConfirmActions, "key"> & { key: ConfirmKey }
  > = [];

  if (ticket.status === TICKET_STATUS.pending && canAssignTicket) {
    confirmableActions.push({
      label: "Assign to me",
      key: "self-assign",
      icon: UserPlus,
    });
  }

  if (canDeleteTicket) {
    confirmableActions.push({
      label: "Delete",
      key: "delete",
      icon: Trash2,
      variant: "destructive",
    });
  }

  return (
    <>
      <RowActionsMenu
        ariaLabel={`Actions for ticket ${ticket.title ?? ticket.id}`}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        baseActions={baseActions}
        confirmActions={confirmableActions}
        onConfirmAction={(key) => {
          setMenuOpen(false);
          setConfirmKey(key);
        }}
      />

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <AppSheetContent
          side="bottom"
          className="h-full max-h-screen max-w-[100vw] md:max-w-full"
        >
          <AppSheetHeader
            title="Manage Ticket"
            description="Update this maintenance request from a focused workspace."
            icon={Wrench}
          />
          <AppSheetBody className="flex justify-center">
            <div className="w-3/4">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Edit Maintenance Ticket
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update this maintenance request. Fields marked{" "}
                  <span className="font-medium text-destructive">*</span> are
                  required.
                </p>
              </div>
              {createTicketError ? (
                <ErrorList error={createTicketError} />
              ) : null}
              <FormProvider {...methods}>
                <div className="flex items-start gap-6">
                  <div className="min-w-0 flex-1">
                    <TicketForm ticket={ticket} onSubmit={onSubmit} />
                  </div>
                  <div className="w-80 shrink-0">
                    <TicketSummary
                      initialAttachmentCounts={{
                        images: ticket?.images?.length || 0,
                        videos: ticket?.videos?.length || 0,
                        documents: ticket?.documents?.length || 0,
                      }}
                    />
                  </div>
                </div>
              </FormProvider>
            </div>
          </AppSheetBody>
        </AppSheetContent>
      </Sheet>

      <HandOffTicketForm
        ticket={ticket}
        open={handoffOpen}
        onOpenChange={setHandoffOpen}
      />

      <SendTechnicianRequestForm
        ticket={ticket}
        open={sendRequestOpen}
        onOpenChange={setSendRequestOpen}
      />

      {activeConfirm ? (
        <ActionConfirmDialog
          open={!!activeConfirm}
          onOpenChange={(o) => !o && setConfirmKey(null)}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          variant={activeConfirm.variant}
          icon={activeConfirm.icon}
          isLoading={isLoading}
          onConfirm={async () => {
            await activeConfirm.onConfirm();
          }}
        >
          {confirmKey === "delete" && deleteTicketError ? (
            <ErrorList error={deleteTicketError} />
          ) : null}
          {confirmKey === "self-assign" && assignTicketError ? (
            <ErrorList error={assignTicketError} />
          ) : null}
        </ActionConfirmDialog>
      ) : null}
    </>
  );
};
