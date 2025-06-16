import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiPencil, HiSquare2Stack, HiTrash } from 'react-icons/hi2';
import { UserRowActionsProps } from '@/app/shared/model/model';
import Modal from '@/app/shared/components/modal/Modal';
import { CgMenuGridO } from 'react-icons/cg';

const UserRowAction: FC<UserRowActionsProps> = ({ user }) => {
	return (
		<td className='p-2 md:px-2 md:py-2 space-x-3'>
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
									<div className='px-1 py-1 '>
										<Menu.Item>
											{({ active }) => (
												<Modal.Open opens='edit-cabin-form'>
													<button className='group text-black flex w-full gap-1  items-center rounded-md px-2 py-2 text-sm'>
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

										{/* {user.role === 'ADMIN' && (
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
													<button className='group text-black  gap-1 flex w-full items-center rounded-md px-2 py-2 text-sm'>
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
						</>
					)}
				</Menu>
			</Modal>
		</td>
	);
};

export default UserRowAction;
