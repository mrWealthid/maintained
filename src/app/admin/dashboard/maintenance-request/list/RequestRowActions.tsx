'use client';
import React, { FC, Fragment, useState } from 'react';

import { Menu, Transition } from '@headlessui/react';

import Link from 'next/link';
import Modal from '@/components/shared/modal/Modal';

// import ConfirmationPage from '../../../../components/ui/ConfirmationPage';

// import { useDeleteBooking, useCheckOutBooking } from '../hooks/useBookings';
import {
	HiArrowDownOnSquare,
	HiArrowUpOnSquare,
	HiEye,
	HiTrash
} from 'react-icons/hi2';
import { MdOutlineLocalPrintshop, MdOutlinePrint } from 'react-icons/md';
import { CgMenuGridO } from 'react-icons/cg';
import { MaintenanceRequest } from '@/components/shared/model/model';
import { useDeleteMaintenanceTicket } from '../hooks/maintenanceHooks';
import { RequestRowActionsProps } from '../model/maintenance.model';
import ConfirmationPage from '@/components/ui/ConfirmationPage';

// import ReceiptPopup from '@/components/shared/Modal/ReceiptPopup';

const RequestRowActions: FC<RequestRowActionsProps> = ({ request }) => {
	const { isDeleting, deleteTicket } = useDeleteMaintenanceTicket();
	function handleDelete(onCloseModal: () => void) {
		deleteTicket(request._id, {
			onSuccess: () => onCloseModal()
		});
	}
	// const { isDeleting, deleteBooking } = useDeleteBooking();
	// const { isCheckingOut, checkOutBooking } = useCheckOutBooking(request.id);

	const [open, setOpen] = useState(false);

	// function handleDelete(onCloseModal: any) {
	// 	deleteBooking(request.id, {
	// 		onSuccess: () => onCloseModal()
	// 	});
	// }
	// function handleCheckout(onCloseModal: any) {
	// 	checkOutBooking(
	// 		{ checkStatus: 'CHECKED_OUT' },
	// 		{
	// 			onSuccess: () => onCloseModal()
	// 		}
	// 	);
	// }

	return (
		<td className='py-2 px-4  md:px-2 md:py-4 space-x-3'>
			<Modal>
				<Menu as='div' className='relative inline-block text-left'>
					{({ open }) => (
						<>
							<div>
								<Menu.Button
									className={`inline-flex card w-full justify-center rounded-full border p-3 text-sm font-medium text-primary dark:text-white

          ${open ? 'ring-1 ring-primary ring-offset-1 bg-gray-50 ' : ''}
        `}>
									<CgMenuGridO />
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
								<Menu.Items className='absolute text-black z-50 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'>
									<div className='px-1 py-1'>
										{/* {request.checkStatus ===
											'CHECKED_IN' && (
											<Menu.Item>
												{({ active }) => (
													<Modal.Open opens='check-out'>
														<button className='group gap-1 flex w-full   items-center rounded-md px-2 py-2 text-sm'>
															{active ? (
																<HiArrowUpOnSquare />
															) : (
																<HiArrowUpOnSquare />
															)}
															Check-Out
														</button>
													</Modal.Open>
												)}
											</Menu.Item>
										)} */}
										{/* {request.checkStatus ===
											'CHECKED_OUT' && (
											<Menu.Item>
												{({ active }) => (
													<button
														onClick={() =>
															setOpen(true)
														}
														className='group gap-1 flex w-full   items-center rounded-md px-2 py-2 text-sm'>
														{active ? (
															<MdOutlinePrint />
														) : (
															<MdOutlineLocalPrintshop />
														)}
														Print Receipt
													</button>
												)}
											</Menu.Item>
										)} */}
										<Menu.Item>
											{({ active }) => (
												<Link
													href={`bookings/${request.id}`}
													className='group gap-2 flex w-full  duration-700 transition-all hover:bg-gray-100   items-center rounded-md px-2 py-2 text-sm'>
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
												<Modal.Open opens='delete-ticket'>
													<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-gray-100   items-center rounded-md px-2 py-2 text-sm'>
														{active ? (
															<HiTrash color='red' />
														) : (
															<HiTrash color='red' />
														)}
														Delete
													</button>
												</Modal.Open>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</>
					)}
				</Menu>

				<Modal.Window
					name='delete-ticket'
					title='Delete Maintenance Ticket'
					description='Request ticket will be deleted permanently'>
					<ConfirmationPage
						handler={(onCloseModal: any) => {
							handleDelete(onCloseModal);
						}}
						isLoading={isDeleting}
						modalText={
							'Are you sure you want to delete this ticket'
						}
					/>
				</Modal.Window>
				{/* <Modal.Window name="delete-booking">
					<ConfirmationPage
						handler={(onCloseModal: any) => {
							handleDelete(onCloseModal);
						}}
						isLoading={isDeleting}
						modalText={'Are you sure you want to delete cabin'}
					/>
				</Modal.Window> */}

				{/* <Modal.Window name="check-out">
					<ConfirmationPage
						handler={(onCloseModal: any) =>
							handleCheckout(onCloseModal)
						}
						isLoading={isCheckingOut}
						modalText={`Are you sure you want to checkout
							 ${request.guests.name}`}
					/>
				</Modal.Window> */}
			</Modal>

			{/* {open && (
				<ReceiptPopup
					activity={request}
					open={open}
					setOpen={setOpen}
				/>
			)} */}
		</td>
	);
};

export default RequestRowActions;
