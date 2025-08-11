import React, { FC, useState } from 'react';
import Link from 'next/link';
import {
	ManageTicketForm,
	TicketRowActionsProps
} from '@/app/shared/ticket-feat/model/ticket.model';
import {
	useAssignTicket,
	useCreateTicket,
	useDeleteTicket
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import Modal from '@/app/shared/components/modal/Modal';
import ConfirmationPage from '@/app/shared/components/ui/ConfirmationPage';
import { ROLES, TICKET_STATUS } from '@/app/shared/enums/enums';
import { TfiMore } from 'react-icons/tfi';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
	ADMIN_ROUTES_DEFINITION,
	ROUTES_DEFINITION
} from '@/app/shared/routes/routes';
import SendTechnicianRequestForm from '@/app/admin/dashboard/ticket-management/SendTechnicianRequestForm';
import { useAppContext } from '../../contexts/AppContext';
import HandOffTicketForm from '@/app/admin/dashboard/ticket-management/HandOffTicketForm';
import { CreateTicketPayload, Ticket } from '../../model/model';
import { FormProvider, useForm } from 'react-hook-form';
import TicketForm from '../form/TicketForm';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { X } from 'lucide-react';

export const TicketActions: FC<TicketRowActionsProps> = ({ ticket }) => {
	const { isDeleting, handleDeleteTicket } = useDeleteTicket();
	const { isUpdating, handleAssignTicket } = useAssignTicket(ticket.id);
	const [open, setOpen] = useState(false);

	function handleDelete(onCloseModal: () => void) {
		handleDeleteTicket(ticket.id, {
			onSuccess: () => onCloseModal()
		});
	}
	const { user, role } = useAppContext();

	function handleAssign(onCloseModal: () => void) {
		const payload = {
			actionedBy: user?.id,
			status: TICKET_STATUS.processing
		};
		handleAssignTicket(payload, {
			onSuccess: () => onCloseModal()
		});
	}

	const { handleCreateTicket } = useCreateTicket(false);

	const methods = useForm<ManageTicketForm>({
		mode: 'all',
		defaultValues: {
			title: ticket.title,
			description: ticket.description,
			area: ticket.area,
			type: ticket.type,
			category:
				typeof ticket.category === 'object'
					? ticket.category.id
					: ticket.category,
			images: undefined,
			videos: undefined
		}
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
			}
		});
	};

	return (
		<>
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
				<DropdownMenuContent align='end' className=''>
					<DropdownMenuItem>
						<Link
							href={`${role === ROLES.user ? ROUTES_DEFINITION.DASHBOARD.TICKETS : ADMIN_ROUTES_DEFINITION.DASHBOARD.TICKETS}/${ticket.id}`}>
							View Details
						</Link>
					</DropdownMenuItem>

					{ticket.status === TICKET_STATUS.pending &&
						role === ROLES.user && (
							<DropdownMenuItem
								className='cursor-pointer'
								onSelect={(e) => {
									e.stopPropagation();
									setOpen(true); // you manage open state
								}}>
								Edit
							</DropdownMenuItem>
						)}
					{/*  This feat should be executed only by an admin */}
					{ticket.status === TICKET_STATUS.pending &&
						role === ROLES.admin && (
							<DropdownMenuItem>
								<Modal.Open opens='self-assign'>
									<button
										type='button'
										className='w-full text-left'>
										Assign to me
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						)}
					{role === ROLES.admin &&
						user?.id === ticket.actionedBy?.id &&
						ticket.status !== TICKET_STATUS.pending && (
							<DropdownMenuItem>
								<Modal.Open opens='handoff-ticket'>
									<button
										type='button'
										className='w-full text-left'>
										Handoff
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						)}
					{role === ROLES.super_admin &&
						ticket.status !== TICKET_STATUS.pending && (
							<DropdownMenuItem>
								<Modal.Open opens='handoff-ticket'>
									<button
										type='button'
										className='w-full text-left'>
										Handoff
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						)}

					{/*  This feat should be executed by an admin who
					created the ticket only */}
					{ticket.status === TICKET_STATUS.processing &&
						role === ROLES.admin &&
						user?.id === ticket.actionedBy?.id && (
							<DropdownMenuItem>
								<Modal.Open opens='send-request-technicians'>
									<button
										type='button'
										className='w-full text-left'>
										Assign
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						)}

					{ticket.status === TICKET_STATUS.pending_assignment &&
						role === ROLES.admin && (
							<DropdownMenuItem>
								<Modal.Open opens='send-request-technicians'>
									<button
										type='button'
										className='w-full text-left'>
										Update Assignment
									</button>
								</Modal.Open>
							</DropdownMenuItem>
						)}
					{/* <DropdownMenuSeparator /> */}
					{/* TODO:: This feat should be executed by the user who
					created the ticket only */}
					{role === ROLES.user && (
						<DropdownMenuItem>
							<Modal.Open opens='delete-ticket'>
								<button
									type='button'
									className='w-full text-left'>
									Delete
								</button>
							</Modal.Open>
						</DropdownMenuItem>
					)}
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
				title='Admin Assignment'
				description='Request ticket will be actioned by you'>
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
				name='send-request-technicians'
				title='Send Technicians Ticket Request'
				description='Request ticket will be sent To Technicians'>
				<SendTechnicianRequestForm ticket={ticket} />
			</Modal.Window>

			<Modal.Window
				name='handoff-ticket'
				title='Hand-off Ticket Request'
				description='Request ticket will be reassigned to a new admin'>
				<HandOffTicketForm ticket={ticket} />
			</Modal.Window>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent
					side='bottom'
					className='w-full  max-h-screen  overflow-y-auto  max-w-[90vw] md:max-w-full'>
					<SheetClose asChild>
						<Button
							variant='ghost'
							size='icon'
							className='absolute top-4 right-4 rounded-full p-2 text-gray-600 bg-muted hover:bg-gray-100 dark:hover:bg-gray-800'>
							<X className='w-6 h-6' />{' '}
						</Button>
					</SheetClose>

					<div className='h-full w-2/3 mx-auto flex flex-col gap-4 px-4 py-6'>
						<SheetHeader>
							<SheetTitle>Manage Ticket</SheetTitle>
							<SheetDescription>
								Seamlessly manage requests
							</SheetDescription>
						</SheetHeader>

						<FormProvider {...methods}>
							<TicketForm ticket={ticket} onSubmit={onSubmit} />
						</FormProvider>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};
