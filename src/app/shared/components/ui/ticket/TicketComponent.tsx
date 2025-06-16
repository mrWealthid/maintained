'use client';

import React, { FC, useState } from 'react';
import TicketCard from './TicketCard';

import { TICKET_STATUS } from '@/utils/enums';
import Tabs from './Tabs';
import { IListResponse } from '../../table/models/table.model';
import { useFetchTickets } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { Ticket } from '@/app/shared/model/model';

const TicketComponent: FC = () => {
	const [status, setStatus] = useState<TICKET_STATUS>(TICKET_STATUS.pending);
	const {
		isLoading,
		error,
		data,
		totalRecords,
		results,
		isRefetching
	}: IListResponse<Ticket> = useFetchTickets<Ticket>(status);

	function handleClick(val: TICKET_STATUS) {
		setStatus(val);
	}
	return (
		<>
			<Tabs status={status} handleClick={handleClick} />
			<section className='grid md:grid-cols-3  grid-cols-1 gap-2'>
				{data.map((ticket: Ticket) => (
					<TicketCard key={ticket._id} {...ticket} />
				))}
			</section>
		</>
	);
};

export default TicketComponent;
