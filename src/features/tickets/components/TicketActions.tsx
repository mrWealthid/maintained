"use client";

import { useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Eye,
  Edit,
  Send,
  Repeat,
  Trash2,
  Wrench,
} from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { Sheet } from "@/components/ui/sheet";
import {
  AppSheetBody,
  AppSheetContent,
  AppSheetFooter,
  AppSheetHeader,
} from "@/shared/components/AppSheetShell";
import RowActionsMenu from "@/shared/components/table/RowActionsMenu";
import ActionConfirmDialog from "@/shared/components/ActionConfirmDialog";
import ErrorList from "@/components/ui/ErrorList";
import { Button } from "@/components/ui/button";

import { AI_TRIAGE_STATUS, ROLES, TICKET_STATUS } from "@/shared/enums/enums";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { useAppContext } from "@/shared/contexts/AppContext";
import { PERMISSION } from "@/shared/auth/permission-registry";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import type { BaseActions, ConfirmActions } from "@/shared/model/model";
import type { CreateTicketPayload } from "@/shared/model/model";

import { TicketRowActionsProps } from "../models/ticket.model";
import {
  ticketCreateFormSchema,
  type TicketCreateFormValues,
} from "../models/ticket-form.model";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateTicket,
  useDeleteTicket,
  useReTriageTicket,
} from "../hooks/ticketHooks";
import TicketForm from "../forms/TicketForm";
import TicketSummary from "./TicketSummary";
import HandOffTicketForm from "../forms/HandOffTicketForm";
import SendTechnicianRequestForm from "@/features/technician-requests/forms/SendTechnicianRequestForm";

type ConfirmKey = "delete";

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
  const ticketSlug = ticket.slug;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [sendRequestOpen, setSendRequestOpen] = useState(false);
  const [confirmKey, setConfirmKey] = useState<ConfirmKey | null>(null);

  const { isDeleting, handleDeleteTicket, deleteTicketError } =
    useDeleteTicket();
  const { isReTriaging, handleReTriage } = useReTriageTicket();
  const { isCreating, handleCreateTicket, createTicketError } = useCreateTicket(
    true,
    ticketSlug,
  );

  const canEditTicket = useHasPermission(PERMISSION.TICKETS_EDIT);
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE,
  );
  const canDeleteTicket = useHasPermission(PERMISSION.TICKETS_DELETE);
  const canCreateTechnicianRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE,
  );
  const isTenant =
    user.role === ROLES.tenant || user.role === ROLES.user;
  const canOpenEditTicket =
    (canEditTicket && ticket.status === TICKET_STATUS.pending) ||
    (isTenant && ticket.status === TICKET_STATUS.processing);

  const isLoading = isDeleting || isReTriaging;

  const methods = useForm<TicketCreateFormValues>({
    resolver: zodResolver(ticketCreateFormSchema) as never,
    mode: "all",
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      area: ticket.area,
      relatedTo: getRelatedTicketId(ticket.relatedTo),
      category:
        typeof ticket.category === "object"
          ? ticket.category.id
          : ticket.category,
    },
  });
  const {
    formState: { isDirty, isValid },
  } = methods;
  const ticketFormId = `edit-ticket-form-${ticketSlug}`;

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void; onError?: () => void },
  ) => {
    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setEditOpen(false);
      },
      onError: () => {
        actions?.onError?.();
      },
    });
  };

  const confirmConfig: Record<ConfirmKey, ConfirmConfigItem> = {
    delete: {
      title: "Delete Maintenance Ticket",
      description:
        "This action cannot be undone. The ticket will be permanently removed.",
      confirmLabel: isDeleting ? "Deleting..." : "Delete",
      variant: "destructive",
      icon: Trash2,
      onConfirm: () => {
        handleDeleteTicket(ticketSlug, {
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
        router.push(`${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/${ticketSlug}`),
      icon: Eye,
    },
  ];

  if (canOpenEditTicket) {
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
    canManageTicketStatus
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
    [
      TICKET_STATUS.pending,
      TICKET_STATUS.processing,
      TICKET_STATUS.pending_assignment,
    ].includes(ticket.status as TICKET_STATUS) &&
    canCreateTechnicianRequest
  ) {
    baseActions.push({
      label:
        ticket.status === TICKET_STATUS.pending_assignment
          ? "Update assignment"
          : "Send to technician",
      action: () => {
        setMenuOpen(false);
        setSendRequestOpen(true);
      },
      icon: Send,
    });

  }

  if (
    !isTenant &&
    canEditTicket &&
    ticket.aiTriageStatus !== AI_TRIAGE_STATUS.pending &&
    ticket.aiTriageStatus !== AI_TRIAGE_STATUS.processing
  ) {
    baseActions.push({
      label: "Re-run AI triage",
      action: () => {
        setMenuOpen(false);
        handleReTriage(ticket.slug);
      },
      icon: Bot,
    });
  }

  const confirmableActions: Array<
    Omit<ConfirmActions, "key"> & { key: ConfirmKey }
  > = [];

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
        ariaLabel={`Actions for ticket ${ticket.title ?? ticketSlug}`}
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
          className="h-dvh max-h-dvh max-w-[100vw] md:max-w-full"
        >
          <AppSheetHeader
            title="Edit Maintenance Ticket"
            description="Update this maintenance request from a focused workspace."
            icon={Wrench}
          />
          <AppSheetBody className="mx-auto w-full max-w-6xl">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground sm:text-3xl">
                Edit Maintenance Ticket
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Update this maintenance request.
              </p>
            </div>
            {createTicketError ? <ErrorList error={createTicketError} /> : null}
            <FormProvider {...methods}>
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0">
                  <TicketForm
                    ticket={ticket}
                    formId={ticketFormId}
                    onSubmit={onSubmit}
                    showActions={false}
                    onCancel={() => setEditOpen(false)}
                  />
                </div>
                <div className="order-first min-w-0 lg:order-0">
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
          </AppSheetBody>
          <AppSheetFooter className="gap-3 sm:items-center sm:justify-end">
            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:flex sm:items-center">
              <Button
                type="button"
                variant="outline"
                disabled={isCreating}
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={ticketFormId}
                disabled={!isValid || isCreating || !isDirty}
              >
                {isCreating ? "Saving..." : "Save Ticket"}
              </Button>
            </div>
          </AppSheetFooter>
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
        </ActionConfirmDialog>
      ) : null}
    </>
  );
};

function getRelatedTicketId(relatedTo: unknown) {
  if (!relatedTo) return "";
  if (typeof relatedTo === "string") return relatedTo;
  if (typeof relatedTo === "object" && "id" in relatedTo) {
    const id = (relatedTo as { id?: unknown }).id;
    return typeof id === "string" ? id : "";
  }
  return "";
}
