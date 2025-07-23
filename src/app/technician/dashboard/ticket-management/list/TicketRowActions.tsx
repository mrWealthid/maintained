'use client';
import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import { HiEye } from 'react-icons/hi2';
import {
	TechnicianRowActionsProps,
	TicketRowActionsProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import {
	useAssignTicket,
	useDeleteTicket,
	useProcessTechnicianResponse
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import Modal from '@/app/shared/components/modal/Modal';
import { TECHNICIAN_RESPONSE, TICKET_STATUS } from '@/app/shared/enums/enums';
import { TfiMore } from 'react-icons/tfi';
import DeclineForm from '../DeclineForm';
import { TableCell } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import ApplyForm from '../ApplyForm';

const TicketRowActions: FC<TechnicianRowActionsProps> = ({
	technicianRequest
}) => {
	// const { isUpdating, handleAssignTicket } = useAssignTicket(ticket._id);

	// const { isProcessing, processResponse } = useProcessTechnicianResponse(
	// 	technicianRequest._id
	// );
	// function handleProcessResponse(onCloseModal: () => void) {
	// 	const payload = { response: TECHNICIAN_RESPONSE.applied };
	// 	processResponse(payload, {
	// 		onSuccess: () => onCloseModal()
	// 	});
	// }

	// function handleAssign(onCloseModal: () => void) {
	// 	const payload = { status: TICKET_STATUS.processing };
	// 	handleAssignTicket(payload, {
	// 		onSuccess: () => onCloseModal()
	// 	});
	// }

	return (
		<TableCell className='md:px-2 py-2 space-x-3'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant={'ghost'}
						className='data-[state=open]:bg-muted text-muted-foreground flex size-8'
						size='icon'>
						<TfiMore />
						<span className='sr-only'>Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end' className='w-32'>
					<DropdownMenuItem>
						<Link href={`bookings/${technicianRequest.ticket.id}`}>
							View Details
						</Link>
					</DropdownMenuItem>
					{technicianRequest.ticket.status ===
						TICKET_STATUS.pending_assignment &&
						technicianRequest.status ===
							TECHNICIAN_RESPONSE.pending && (
							<>
								<DropdownMenuItem>
									{/* <Modal.Open opens='accept-request'> */}

									<Link
										href={`ticket-management/apply/${technicianRequest._id}`}
										type='button'
										className='w-full text-left'>
										Apply
									</Link>

									{/* </Modal.Open> */}
								</DropdownMenuItem>

								<DropdownMenuItem>
									<Modal.Open opens='decline-ticket'>
										<button
											type='button'
											className='w-full text-left'>
											Decline
										</button>
									</Modal.Open>
								</DropdownMenuItem>
							</>
						)}

					{technicianRequest.status ===
						TECHNICIAN_RESPONSE.applied && (
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
									href={`ticket-management/apply/${technicianRequest._id}`}
									type='button'
									className='w-full text-left'>
									Update
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem>
								<Modal.Open opens='decline-ticket'>
									<button
										type='button'
										className='w-full text-left'>
										Decline
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<Modal.Window
				name='decline-ticket'
				title='Decline Maintenance Ticket'
				description='Request ticket will be declined'>
				<DeclineForm ticketRequest={technicianRequest} />
			</Modal.Window>
			<Modal.Window
				size='w-full md:w-1/2  3xl:w-1/3'
				name='accept-request'
				title='Apply for Ticket'
				description='Submit your bid to get this ticket'>
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
