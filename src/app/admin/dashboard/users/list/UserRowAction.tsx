import React, { FC } from 'react';

import { UserRowActionsProps } from '@/app/shared/model/model';
import Modal from '@/app/shared/components/modal/Modal';
import ConfirmationPage from '@/app/shared/components/ui/ConfirmationPage';
import { useDeleteUser } from '../hooks/userHooks';
import UserForm from '../UserForm';
import { TfiMore } from 'react-icons/tfi';
import { TableCell } from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const UserRowAction: FC<UserRowActionsProps> = ({ user }) => {
	const { isDeleting, deleteUser } = useDeleteUser();

	function handleDelete(onCloseModal: () => void) {
		if (!user.id) return;
		deleteUser(user.id, {
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
						<Modal.Open opens='edit-user-form'>
							<button type='button' className='w-full text-left'>
								Edit
							</button>
						</Modal.Open>
					</DropdownMenuItem>
					{/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
					<DropdownMenuItem>Favorite</DropdownMenuItem> */}
					{/* <DropdownMenuSeparator /> */}
					<DropdownMenuItem>
						<Modal.Open opens='delete-user'>
							<button type='button' className='w-full text-left'>
								Delete
							</button>
						</Modal.Open>
						{/* Delete */}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Modal.Window
				title='Manage User'
				description='Manage your users'
				name='edit-user-form'>
				<UserForm user={user} />
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
		</TableCell>
	);
};

export default UserRowAction;
