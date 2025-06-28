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
import Empty from '../../components/empty/Empty';
import AnimatedBorderWrapper from '../../components/animation/AnimatedBorder';
import TicketCardLoader from '../loaders/TicketCardLoader';
import {
	Sidebar,
	SideBarBody,
	SideBarFooter,
	SideBarHeader,
	useSidebarContext
} from '../../components/sidebar/SidebarContext';

const TicketComponent: FC = () => {
	const [status, setStatus] = useState<TICKET_STATUS>(TICKET_STATUS.pending);
	const [search, setSearch] = useState<string>('');

	const debouncedSearchTerm = useDebounce(search, 1000);

	const { isLoading, error, data, totalRecords, results, isRefetching } =
		useFetchTickets<Ticket>(status, { title: debouncedSearchTerm });

	function handleClick(val: TICKET_STATUS) {
		setStatus(val);
	}

	const { isOpen, setIsOpen, sidebarRef } = useSidebarContext();

	return (
		<section>
			<div className='flex w-full mb-3 justify-between flex-wrap items-center'>
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

			<button onClick={() => setIsOpen(!isOpen)}>Open Sidebar</button>

			{isOpen && (
				<Sidebar>
					<SideBarHeader />
					<SideBarBody>
						<p>Test</p>
						{/* <SideBarLinks routes={routes}></SideBarLinks> */}
					</SideBarBody>
					<SideBarFooter />
				</Sidebar>
			)}

			{isLoading && (
				<section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2'>
					{Array.from({ length: 9 }).map((_, i) => (
						<AnimatedBorderWrapper key={i} loading={isLoading}>
							<TicketCardLoader key={i} />
						</AnimatedBorderWrapper>
					))}
				</section>
			)}

			{data && data?.length > 0 && (
				<section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2'>
					{data?.map((ticket: Ticket) => (
						<TicketCard key={ticket._id} {...ticket} />
					))}
				</section>
			)}
			{data?.length === 0 && !isLoading && <Empty />}
		</section>
	);
};

export default TicketComponent;
