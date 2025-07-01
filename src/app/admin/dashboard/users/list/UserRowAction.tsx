import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiPencil, HiSquare2Stack, HiTrash } from 'react-icons/hi2';
import { UserRowActionsProps } from '@/app/shared/model/model';
import Modal from '@/app/shared/components/modal/Modal';
import { CgMenuGridO } from 'react-icons/cg';
import ConfirmationPage from '@/app/shared/components/ui/ConfirmationPage';
import { useDeleteUser } from '../hooks/userHooks';
import UserForm from '../UserForm';
import { TfiMore } from 'react-icons/tfi';

const UserRowAction: FC<UserRowActionsProps> = ({ user }) => {
	const { isDeleting, deleteUser } = useDeleteUser();

	function handleDelete(onCloseModal: () => void) {
		if (!user._id) return;
		deleteUser(user._id, {
			onSuccess: () => onCloseModal()
		});
	}
	return (
		<td className='p-2 md:px-2 md:py-2 space-x-3'>
			<Menu as='div' className='relative inline-block text-left'>
				{({ open }) => (
					<>
						<div>
							<Menu.Button
								className={`inline-flex  w-full justify-center rounded-full border p-3 text-sm font-medium

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
							<Menu.Items className='absolute bg-card border  z-50 right-0 mt-2 w-56 origin-top-right divide-y  rounded-md shadow-lg ring-1 ring-black/5 focus:outline-none'>
								<div className='px-1 py-1 '>
									<Menu.Item>
										{({ active }) => (
											<Modal.Open opens='edit-user-form'>
												<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
													{active ? (
														<HiPencil color='green' />
													) : (
														<HiPencil color='green' />
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
											<Modal.Open opens='delete-user'>
												<button className='group gap-2 flex w-full  duration-700 transition-all hover:bg-secondary   items-center rounded-md px-2 py-2 text-sm'>
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
				title='Manage User'
				description='Manage your users'
				name='edit-user-form'>
				<UserForm user={user} />
				{/* <GuestForm guest={guest} /> */}
			</Modal.Window>

			<Modal.Window
				title='Delete User'
				description='User will be deleted permanently'
				name='delete-user'>
				<ConfirmationPage
					handler={(onCloseModal: () => void) => {
						handleDelete(onCloseModal);
					}}
					isLoading={isDeleting}
					modalText={
						<span>
							Are you sure you want to delete <b>{user.name}</b>
						</span>
					}
				/>
			</Modal.Window>
		</td>
	);
};

export default UserRowAction;
