'use client';

import React, { useState } from 'react';
import MaintenanceCard from './MaintenanceCard';
import Tabs from '../../app/admin/dashboard/maintenance-request/Tabs';
import { IListResponse } from '@/components/table/models/table.model';
import { IRequest } from '../shared/model/model';
import { useFetchMaintenanceRequests } from '@/app/(users)/dashboard/maintenance-request/hooks/maintenanceHooks';

const MaintenanceComponent = () => {
	const [status, setStatus] = useState<string>('PENDING');
	const {
		isLoading,
		error,
		data,
		totalRecords,
		results,
		isRefetching
	}: IListResponse = useFetchMaintenanceRequests(status);

	function handleClick(val: string) {
		setStatus(val);
	}
	return (
		<>
			<Tabs status={status} handleClick={handleClick} />
			<section className='grid md:grid-cols-3  grid-cols-1 gap-2'>
				{data?.map((request: IRequest) => (
					<MaintenanceCard key={request._id} {...request} />
				))}
			</section>
		</>
	);
};

export default MaintenanceComponent;
