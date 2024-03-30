import Modal from '@/components/shared/Modal/Modal-component';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiPencil, HiSquare2Stack, HiTrash } from 'react-icons/hi2';

const UserRowAction = ({ rowData }: any) => {
	return (
		<td className='p-2 md:px-2 md:py-2 space-x-3'>
			<Modal>
				<Menu as='div' className='relative inline-block text-left'>
					<div>
						<Menu.Button className='inline-flex w-full justify-center rounded-md border dark:glass  focus:border-primary dark:focus:border-transparent focus:border-2  px-4 py-2 text-sm font-medium text-primary dark:text-white  '>
							<span>...</span>
							{/* <ChevronDownIcon
								className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
								aria-hidden="true"
							/> */}
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
							<div className='px-1 py-1 '>
								<Menu.Item>
									{({ active }) => (
										<Modal.Open opens='edit-cabin-form'>
											<button className='group text-black flex w-full gap-1  hover:glass items-center rounded-md px-2 py-2 text-sm'>
												{active ? (
													<HiPencil />
												) : (
													<HiPencil />
												)}
												Edit
											</button>
										</Modal.Open>
									)}
								</Menu.Item>

								{/* {rowData.role === 'ADMIN' && (
									<Menu.Item>
										{({ active }) => (
											<Modal.Open opens='edit-cabin-form'>
												<button className='group text-black flex w-full gap-1  hover:glass items-center rounded-md px-2 py-2 text-sm'>
													{active ? (
														<HiPencil />
													) : (
														<HiPencil />
													)}
													Make User
												</button>
											</Modal.Open>
										)}
									</Menu.Item>
								)} */}
							</div>
							<div className='px-1 py-1'>
								<Menu.Item>
									{({ active }) => (
										<Modal.Open opens='confirm-modal'>
											<button className='group text-black  hover:glass gap-1 flex w-full items-center rounded-md px-2 py-2 text-sm'>
												{active ? (
													<HiTrash />
												) : (
													<HiTrash />
												)}
												Delete
											</button>
										</Modal.Open>
									)}
								</Menu.Item>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>

				{/* <Modal.Window name="edit-cabin-form">
					<CabinForm />
				</Modal.Window> */}

				{/* <Modal.Window name="confirm-modal">
					<ConfirmationPage
						handler={(onCloseModal: any) => {
							// handleDelete(rowData.id, onCloseModal)
							deleteCabin(rowData.id);
							onCloseModal();
						}}
						modalText={'Are you sure you want to delete cabin'}
					/>
				</Modal.Window>
				<Modal.Window name="confirm-duplicate">
					<ConfirmationPage
						handler={(onCloseModal: any) => {
							duplicateCabin(rowData);
							onCloseModal();
						}}
						modalText={'Are you sure you want to duplicate cabin'}
					/>
				</Modal.Window> */}
			</Modal>
		</td>
	);
};

export default UserRowAction;
