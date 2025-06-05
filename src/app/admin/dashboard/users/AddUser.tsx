'use client';

import React, { useState } from 'react';
import Modal from '@/components/shared/modal/Modal';

import { CiCirclePlus } from 'react-icons/ci';
import UserForm from './UserForm';

const AddUser = ({ settings }: any) => {
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
				<UserForm settings={settings} />
			</Modal.Window>
		</Modal>
	);
};

export default AddUser;
