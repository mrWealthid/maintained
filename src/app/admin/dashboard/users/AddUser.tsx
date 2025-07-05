'use client';
import React, { FC } from 'react';
import { CiCirclePlus } from 'react-icons/ci';
import UserForm from './UserForm';
import Modal from '@/shared/components/modal/Modal';

const AddUser: FC = () => {
	return (
		<Modal>
			<Modal.Open opens='user-form'>
				<div>
					<button
						type='button'
						className='btn-primary flex items-center gap-1 rounded-3xl'>
						<CiCirclePlus size={18} /> Add A User
					</button>
				</div>
			</Modal.Open>
			<Modal.Window
				title='Manage Users'
				description='Add team members to your organization'
				name='user-form'>
				<UserForm />
			</Modal.Window>
		</Modal>
	);
};

export default AddUser;
