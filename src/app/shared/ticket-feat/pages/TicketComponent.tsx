'use client';

import React, { FC, useState } from 'react';
import TicketCard from './TicketCard';
import { TICKET_STATUS } from '@/utils/enums';
import { useFetchTickets } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { Ticket } from '@/app/shared/model/model';
import { tabData } from '../data/data';
import FilterTabs from '../../components/tabs/FilterTabs';

const TicketComponent: FC = () => {
	const [status, setStatus] = useState<TICKET_STATUS>(TICKET_STATUS.pending);
	const { isLoading, error, data, totalRecords, results, isRefetching } =
		useFetchTickets<Ticket>(status);

	function handleClick(val: TICKET_STATUS) {
		setStatus(val);
	}
	return (
		<>
			<FilterTabs
				status={status}
				handleClick={handleClick}
				data={tabData}
			/>
			<section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2'>
				{data?.map((ticket: Ticket) => (
					<TicketCard key={ticket._id} {...ticket} />
				))}
			</section>
		</>
	);
};

export default TicketComponent;
