'use client';
import Modal from '@/components/shared/Modal/Modal-component';
import React from 'react';
import { CiCirclePlus } from 'react-icons/ci';
import MaintenanceForm from './MaintenanceForm';

const AddMaintenance = () => {
	return (
		<div className=''>
			<Modal>
				<Modal.Open opens='request-form'>
					<div>
						<button
							type='button'
							className='btn-primary flex items-center gap-1 rounded-3xl'>
							<CiCirclePlus size={18} /> Make Request
						</button>
					</div>
				</Modal.Open>
				<Modal.Window name='request-form'>
					<MaintenanceForm />
				</Modal.Window>
			</Modal>
		</div>
	);
};

export default AddMaintenance;
