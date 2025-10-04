"use client";
import React, { FC } from "react";
import Link from "next/link";
import { TechnicianRowActionsProps } from "@/app/shared/features/ticket-feat/model/ticket.model";
import Modal from "@/app/shared/components/modal/Modal";
import { TECHNICIAN_RESPONSE, TICKET_STATUS } from "@/app/shared/enums/enums";
import { TfiMore } from "react-icons/tfi";
import DeclineForm from "../DeclineForm";
import { TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ApplyForm from "../ApplyForm";
import { TECHNICIAN_ROUTES_DEFINITION } from "@/app/shared/routes/routes";

const TicketRowActions: FC<TechnicianRowActionsProps> = ({
  technicianRequest,
}) => {
  return (
    <TableCell className="md:px-2 py-2 space-x-3">
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
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>
            <Link
              href={`${TECHNICIAN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${technicianRequest.ticket.id}`}
            >
              View Details
            </Link>
          </DropdownMenuItem>
          {technicianRequest.ticket.status ===
            TICKET_STATUS.pending_assignment &&
            technicianRequest.status === TECHNICIAN_RESPONSE.pending && (
              <>
                <DropdownMenuItem>
                  {/* <Modal.Open opens='accept-request'> */}

                  <Link
                    href={`ticket-management/apply/${technicianRequest.id}`}
                    type="button"
                    className="w-full text-left"
                  >
                    Apply
                  </Link>

                  {/* </Modal.Open> */}
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Modal.Open opens="decline-ticket">
                    <button type="button" className="w-full text-left">
                      Decline
                    </button>
                  </Modal.Open>
                </DropdownMenuItem>
              </>
            )}

          {technicianRequest.status === TECHNICIAN_RESPONSE.applied && (
            <>
              <DropdownMenuItem>
                {/* <Modal.Open opens='accept-request'>
									<button
										type='button'
										className='w-full text-left'>
										Update
									</button>
								</Modal.Open> */}

                <Link
                  href={`ticket-management/apply/${technicianRequest.id}`}
                  type="button"
                  className="w-full text-left"
                >
                  Update
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Modal.Open opens="decline-ticket">
                  <button type="button" className="w-full text-left">
                    Decline
                  </button>
                </Modal.Open>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Modal.Window
        name="decline-ticket"
        title="Decline Maintenance Ticket"
        description="Request ticket will be declined"
      >
        <DeclineForm ticketRequest={technicianRequest} />
      </Modal.Window>
      <Modal.Window
        size="w-full md:w-1/2  3xl:w-1/3"
        name="accept-request"
        title="Apply for Ticket"
        description="Submit your bid to get this ticket"
      >
        <ApplyForm ticketRequest={technicianRequest} />
      </Modal.Window>
      {/* <Modal.Window
				name='accept-request'
				title='Accept Maintenance Ticket'
				description='Request ticket will be assigned to you'>
				<ConfirmationPage
					handler={(onCloseModal: () => void) => {
						handleProcessResponse(onCloseModal);
					}}
					isLoading={isProcessing}
					modalText={'Are you sure you want to accept this ticket'}
					reason='confirm'
				/>
			</Modal.Window> */}
      {/* <Modal.Window
				name='self-assign'
				title='Assign Ticket'
				description='Request ticket will be assigned to you'>
				<ConfirmationPage
					handler={(onCloseModal) => {
						handleAssign(onCloseModal);
					}}
					isLoading={isUpdating}
					modalText={'Are you sure you want to assign this ticket'}
					reason='confirm'
				/>
			</Modal.Window> */}
    </TableCell>
  );
};

export default TicketRowActions;
