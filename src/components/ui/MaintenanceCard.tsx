import React from 'react';

type maintnenanceType = {
	title: string;
	description: string;
	status: 'PENDING' | 'ASSIGNED' | 'DECLINED' | 'COMPLETED';
	_id: string;
};
const MaintenanceCard = ({
	title,
	description,
	status,
	_id: id
}: maintnenanceType) => {
	return (
		<section className='card flex gap-4 flex-col h-62'>
			<h3 className='text-lg text-primary'>{title}</h3>

			<small>{description}</small>

			<div className='w-full flex justify-end'>
				<button className='btn  btn-primary !w-1/2'>View</button>
			</div>
		</section>
	);
};

export default MaintenanceCard;
