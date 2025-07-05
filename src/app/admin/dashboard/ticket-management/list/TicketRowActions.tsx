'use client';
import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';

import { HiEye, HiTrash } from 'react-icons/hi2';
import { TicketRowActionsProps } from '@/shared/ticket-feat/model/ticket.model';
import {
	useAssignTicket,
	useDeleteTicket
} from '@/shared/ticket-feat/hooks/ticketHooks';
import Modal from '@/shared/components/modal/Modal';
import ConfirmationPage from '@/shared/components/ui/ConfirmationPage';
import { TICKET_STATUS } from '@/shared/enums/enums';
import { MdOutlineAssignmentInd } from 'react-icons/md';
import { TfiMore } from 'react-icons/tfi';
import { TbUserCog } from 'react-icons/tb';
import AssignTechnicianForm from '../AssignTechnicianForm';
import { TableCell } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const TicketRowActions: FC<TicketRowActionsProps> = ({ ticket }) => {
	const { isDeleting, handleDeleteTicket } = useDeleteTicket();
	const { isUpdating, handleAssignTicket } = useAssignTicket(ticket._id);

	function handleDelete(onCloseModal: () => void) {
		handleDeleteTicket(ticket._id, {
			onSuccess: () => onCloseModal()
		});
	}
	function handleAssign(onCloseModal: () => void) {
		const payload = { status: TICKET_STATUS.processing };
		handleAssignTicket(payload, {
			onSuccess: () => onCloseModal()
		});
	}

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
						<Link href={`bookings/${ticket.id}`}>View Details</Link>
					</DropdownMenuItem>

					{/* TODO:: This feat should be executed by an admin who
					created the ticket only */}
					{ticket.status === TICKET_STATUS.pending && (
						<DropdownMenuItem>
							<Modal.Open opens='self-assign'>
								<button type='button'>Assign to me</button>
							</Modal.Open>
						</DropdownMenuItem>
					)}

					{ticket.status === TICKET_STATUS.processing && (
						<DropdownMenuItem>
							<Modal.Open opens='assign-technician'>
								<button type='button'>Assign</button>
							</Modal.Open>
						</DropdownMenuItem>
					)}
					{/* <DropdownMenuSeparator /> */}
					{/* TODO:: This feat should be executed by the user who
					created the ticket only */}
					{
						<DropdownMenuItem>
							<Modal.Open opens='delete-ticket'>
								<button type='button'>Delete</button>
							</Modal.Open>
						</DropdownMenuItem>
					}
				</DropdownMenuContent>
			</DropdownMenu>

			<Modal.Window
				name='delete-ticket'
				title='Delete Maintenance Ticket'
				description='Request ticket will be deleted permanently'>
				<ConfirmationPage
					handler={(onCloseModal) => {
						handleDelete(onCloseModal ?? (() => {}));
					}}
					isLoading={isDeleting}
					modalText={'Are you sure you want to delete this ticket'}
				/>
			</Modal.Window>
			<Modal.Window
				name='self-assign'
				title='Assign Ticket'
				description='Request ticket will be assigned to you'>
				<ConfirmationPage
					handler={(onCloseModal) => {
						handleAssign(onCloseModal ?? (() => {}));
					}}
					isLoading={isUpdating}
					modalText={'Are you sure you want to assign this ticket'}
					reason='confirm'
				/>
			</Modal.Window>

			<Modal.Window
				name='assign-technician'
				title='Assign Maintenance Ticket'
				description='Request ticket will be Assigned To Technician'>
				<AssignTechnicianForm ticket={ticket} />
			</Modal.Window>
		</TableCell>
	);
};

export default TicketRowActions;
