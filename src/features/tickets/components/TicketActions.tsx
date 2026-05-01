"use client";
import React, { FC, useState } from "react";
import Link from "next/link";

import Modal from "@/shared/components/modal/Modal";
import ConfirmationPage from "@/shared/components/ui/ConfirmationPage";
import { TICKET_STATUS } from "@/shared/enums/enums";
import { TfiMore } from "react-icons/tfi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { APP_ROUTE_PATHS } from "@/shared/routes/appRoutePaths";
import SendTechnicianRequestForm from "@/features/technician-requests/forms/SendTechnicianRequestForm";
import { useAppContext } from "@/shared/contexts/AppContext";
import HandOffTicketForm from "@/features/tickets/forms/HandOffTicketForm";
import { CreateTicketPayload } from "@/shared/model/model";
import { FormProvider, useForm } from "react-hook-form";
import TicketForm from "../forms/TicketForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ManageTicketForm, TicketRowActionsProps } from "../models/ticket.model";
import {
  useAssignTicket,
  useCreateTicket,
  useDeleteTicket,
} from "../hooks/ticketHooks";
import ErrorList from "@/components/ui/ErrorList";
import { useHasPermission } from "@/shared/hooks/usePermission";
import { PERMISSION } from "@/shared/auth/permission-registry";

export const TicketActions: FC<TicketRowActionsProps> = ({ ticket }) => {
  const { isDeleting, handleDeleteTicket, deleteTicketError } =
    useDeleteTicket();
  const { isUpdating, handleAssignTicket, assignTicketError } =
    useAssignTicket(ticket.id);

  const [open, setOpen] = useState(false);

  function handleDelete(onCloseModal: () => void) {
    handleDeleteTicket(ticket.id, {
      onSuccess: () => onCloseModal(),
    });
  }
  const { user } = useAppContext();
  const canEditTicket = useHasPermission(PERMISSION.TICKETS_EDIT);
  const canAssignTicket = useHasPermission(PERMISSION.TICKETS_ASSIGN);
  const canManageTicketStatus = useHasPermission(
    PERMISSION.TICKETS_STATUS_MANAGE
  );
  const canDeleteTicket = useHasPermission(PERMISSION.TICKETS_DELETE);
  const canCreateTechnicianRequest = useHasPermission(
    PERMISSION.TECHNICIAN_REQUESTS_CREATE
  );
  const isActionedByCurrentUser = user?.id === ticket.actionedBy?.id;

  function handleAssign(onCloseModal: () => void) {
    const payload = {
      actionedBy: user?.id,
      status: TICKET_STATUS.processing,
    };
    handleAssignTicket(payload, {
      onSuccess: () => onCloseModal(),
    });
  }

  const { handleCreateTicket, createTicketError } = useCreateTicket(
    true,
    ticket.id
  );

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
  // const router = useRouter();

  const onSubmit = (
    data: CreateTicketPayload,
    actions?: { onSuccess: () => void; onError: () => void }
  ) => {
    handleCreateTicket(data, {
      onSuccess: () => {
        actions?.onSuccess();
        setOpen(false);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <TfiMore />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="">
          <DropdownMenuItem>
            <Link
              href={`${APP_ROUTE_PATHS.DASHBOARD.TICKETS}/${ticket.id}`}
            >
              View Details
            </Link>
          </DropdownMenuItem>

          {ticket.status === TICKET_STATUS.pending && canEditTicket && (
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.stopPropagation();
                setOpen(true); // you manage open state
              }}
            >
              Edit
            </DropdownMenuItem>
          )}
          {ticket.status === TICKET_STATUS.pending && canAssignTicket && (
            <DropdownMenuItem>
              <Modal.Open opens="self-assign">
                <button type="button" className="w-full text-left">
                  Assign to me
                </button>
              </Modal.Open>
            </DropdownMenuItem>
          )}
          {ticket.status !== TICKET_STATUS.pending &&
            (canManageTicketStatus ||
              (canAssignTicket && isActionedByCurrentUser)) && (
              <DropdownMenuItem>
                <Modal.Open opens="handoff-ticket">
                  <button type="button" className="w-full text-left">
                    Handoff
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            )}

          {ticket.status === TICKET_STATUS.processing &&
            canCreateTechnicianRequest &&
            (isActionedByCurrentUser || canAssignTicket) && (
              <DropdownMenuItem>
                <Modal.Open opens="send-request-technicians">
                  <button type="button" className="w-full text-left">
                    Assign
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            )}

          {ticket.status === TICKET_STATUS.pending_assignment &&
            canCreateTechnicianRequest && (
              <DropdownMenuItem>
                <Modal.Open opens="send-request-technicians">
                  <button type="button" className="w-full text-left">
                    Update Assignment
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            )}
          {/* <DropdownMenuSeparator /> */}
          {canDeleteTicket && (
            <DropdownMenuItem>
              <Modal.Open opens="delete-ticket">
                <button type="button" className="w-full text-left">
                  Delete
                </button>
              </Modal.Open>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="delete-ticket"
        title="Delete Maintenance Ticket"
        description="Request ticket will be deleted permanently"
      >
        <div className="space-y-3">
          <ConfirmationPage
            handler={(onCloseModal) => {
              handleDelete(onCloseModal ?? (() => {}));
            }}
            isLoading={isDeleting}
            modalText={"Are you sure you want to delete this ticket"}
          />
          {deleteTicketError ? <ErrorList error={deleteTicketError} /> : null}
        </div>
      </Modal.Window>
      <Modal.Window
        name="self-assign"
        title="Admin Assignment"
        description="Request ticket will be actioned by you"
      >
        <div className="space-y-3">
          <ConfirmationPage
            handler={(onCloseModal) => {
              handleAssign(onCloseModal ?? (() => {}));
            }}
            isLoading={isUpdating}
            modalText={"Are you sure you want to assign this ticket"}
            reason="confirm"
          />
          {assignTicketError ? <ErrorList error={assignTicketError} /> : null}
        </div>
      </Modal.Window>

      <Modal.Window
        name="send-request-technicians"
        title="Send Technicians Ticket Request"
        description="Request ticket will be sent To Technicians"
      >
        <SendTechnicianRequestForm ticket={ticket} />
      </Modal.Window>

      <Modal.Window
        name="handoff-ticket"
        title="Hand-off Ticket Request"
        description="Request ticket will be reassigned to a new admin"
      >
        <HandOffTicketForm ticket={ticket} />
      </Modal.Window>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="w-full  overflow-y-auto h-full max-h-screen   max-w-[100vw] md:max-w-full"
        >
          <div className="w-full  flex flex-col gap-4 py-4 px-2 sm:w-2/3 sm:mx-auto sm:px-4">
            <SheetHeader>
              <SheetTitle>Manage Ticket</SheetTitle>
              <SheetDescription>Seamlessly manage requests</SheetDescription>
            </SheetHeader>
            {createTicketError ? <ErrorList error={createTicketError} /> : null}
            <FormProvider {...methods}>
              <TicketForm ticket={ticket} onSubmit={onSubmit} />
            </FormProvider>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
