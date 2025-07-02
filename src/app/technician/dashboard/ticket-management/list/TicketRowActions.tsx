'use client';
import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';

import { HiEye, HiTrash } from 'react-icons/hi2';
import { TicketRowActionsProps } from '@/app/shared/ticket-feat/model/ticket.model';
import {
	useAssignTicket,
	useDeleteTicket
} from '@/app/shared/ticket-feat/hooks/ticketHooks';
import Modal from '@/app/shared/components/modal/Modal';
import ConfirmationPage from '@/app/shared/components/ui/ConfirmationPage';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { MdOutlineAssignmentInd } from 'react-icons/md';
import { TfiMore } from 'react-icons/tfi';
import DeclineForm from '../declineForm';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { RxCross2 } from 'react-icons/rx';

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
		<td className='py-2 px-4  md:px-2 md:py-4 space-x-3'>
			<Modal>
				<Menu as='div' className='relative inline-block text-left'>
					{({ open }) => (
						<>
							<div>
								<Menu.Button
									className={`inline-flex  w-full justify-center  rounded-full border p-3 text-sm font-medium

										  ${open ? 'ring-1 ring-button-primary ring-offset-1  ' : ''}
										`}>
									<TfiMore />
								</Menu.Button>
							</div>
							<Transition
								as={Fragment}
								enter='transition ease-out duration-100'
								enterFrom='transform opacity-0 scale-95'
								enterTo='transform opacity-100 scale-100'
								leave='transition ease-in duration-75'
								leaveFrom='transform opacity-100 scale-100'
								leaveTo='transform opacity-0 scale-95'>
								<Menu.Items className='absolute bg-card border  z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none'>
									<div className='px-1 py-1'>
										<Menu.Item>
											{({ active }) => (
												<Link
													href={`bookings/${ticket.id}`}
													className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
													{active ? (
														<HiEye />
													) : (
														<HiEye />
													)}
													View Details
												</Link>
											)}
										</Menu.Item>

										<Menu.Item>
											{({ active }) => (
												<Modal.Open opens='accept-request'>
													<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
														<IoCheckmarkDoneOutline color='green' />
														Accept
													</button>
												</Modal.Open>
											)}
										</Menu.Item>

										<Menu.Item>
											{({ active }) => (
												<Modal.Open opens='decline-ticket'>
													<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
														<RxCross2 color='red' />
														Decline
													</button>
												</Modal.Open>
											)}
										</Menu.Item>

										{/* {ticket.status ===
											TICKET_STATUS.pending && (
											<Menu.Item>
												{({ active }) => (
													<Modal.Open opens='self-assign'>
														<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
															<MdOutlineAssignmentInd color='#1849aa' />
															Assign to me
														</button>
													</Modal.Open>
												)}
											</Menu.Item>
										)} */}
									</div>
								</Menu.Items>
							</Transition>
						</>
					)}
				</Menu>

				<Modal.Window
					name='decline-ticket'
					title='Decline Maintenance Ticket'
					description='Request ticket will be declined'>
					<DeclineForm ticket={ticket} />
				</Modal.Window>
				<Modal.Window
					name='accept-request'
					title='Accept Maintenance Ticket'
					description='Request ticket will be assigned to you'>
					<ConfirmationPage
						handler={(onCloseModal) => {
							handleDelete(onCloseModal ?? (() => {}));
						}}
						isLoading={isDeleting}
						modalText={
							'Are you sure you want to accept this ticket'
						}
						reason='confirm'
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
						modalText={
							'Are you sure you want to assign this ticket'
						}
						reason='confirm'
					/>
				</Modal.Window>
			</Modal>
		</td>
	);
};

export default TicketRowActions;
