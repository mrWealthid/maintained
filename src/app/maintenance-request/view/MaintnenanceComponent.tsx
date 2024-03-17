'use client';

import React, { useState } from 'react';
import MaintenanceCard from '../MaintenanceCard';
import Tabs from '../Tabs';
import { useFetchMaintenanceRequests } from '../hooks/maintenanceHooks';
import { IListResponse } from '@/components/Table/models/table.model';

type maintnenanceType = {
	title: string;
	description: string;
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	_id: string;
};
const MaintnenanceComponent = () => {
	const [status, setStatus] = useState<string>('ALL');
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
			<section className='grid grid-cols-3 gap-2'>
				{data?.map((request: maintnenanceType) => (
					<MaintenanceCard key={request._id} {...request} />
				))}
			</section>
		</>
	);
};

export default MaintnenanceComponent;
