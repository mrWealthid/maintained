'use client';
import React, { FC, useState } from 'react';
import TicketCard from './TicketCard';
import { ROLES, TICKET_STATUS } from '@/app/shared/enums/enums';
import { useFetchTickets } from '@/app/shared/ticket-feat/hooks/ticketHooks';
import { Ticket } from '@/app/shared/model/model';
import { tabData } from '../data/data';
import FilterTabs from '../../components/tabs/FilterTabs';
import Search from '../../components/search/Search';
import { useDebounce } from '@uidotdev/usehooks';

const TicketComponent: FC<{ role: ROLES }> = ({ role }) => {
	const [status, setStatus] = useState<TICKET_STATUS>(TICKET_STATUS.pending);
	const [search, setSearch] = useState<string>('');

	const debouncedSearchTerm = useDebounce(search, 1000);

	const { isLoading, error, data, totalRecords, results, isRefetching } =
		useFetchTickets<Ticket>(status, { title: debouncedSearchTerm });

	function handleClick(val: TICKET_STATUS) {
		setStatus(val);
	}

	return (
		<>
			<div className='flex w-full justify-between flex-wrap items-center'>
				<Search
					placeHolder='Enter title'
					handleSearch={(val) => setSearch(val)}
				/>

				<FilterTabs
					status={status}
					handleClick={handleClick}
					data={tabData}
				/>
			</div>
			<section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2'>
				{data?.map((ticket: Ticket) => (
					<TicketCard role={role} key={ticket._id} {...ticket} />
				))}
			</section>
		</>
	);
};

export default TicketComponent;
