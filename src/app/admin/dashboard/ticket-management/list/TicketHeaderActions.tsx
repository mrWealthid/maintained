'use client';

import React, { FC, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { getStatusColor } from '@/utils/helper';
import {
	TicketFilterQuery,
	TicketQueryprops
} from '@/app/shared/ticket-feat/model/ticket.model';
import { ticketListFilter } from '@/app/shared/ticket-feat/data/data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TicketHeaderActions: FC<TicketQueryprops> = ({ handleFilter }) => {
	const [query, setQuery] = useState<TicketFilterQuery | null>({
		status: TICKET_STATUS.pending
	});

	async function handleClick(query: TicketFilterQuery | null) {
		setQuery(query);
		handleFilter?.(query);
	}

	return (
		<>
			<Tabs
				value={query?.status ?? TICKET_STATUS.all}
				onValueChange={(val) =>
					handleClick(
						val === TICKET_STATUS.all
							? null
							: { status: val as TICKET_STATUS }
					)
				}
				className='w-auto'>
				<TabsList className='bg-muted p-1 rounded-full shadow-sm space-x-1'>
					{ticketListFilter.map((tab) => (
						<TabsTrigger
							key={tab.value}
							value={tab.value}
							className='rounded-full text-xs px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-foreground transition-all'>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{/*
			<select
				id="sort"
				name="sort"
				title="sortdropdown"
				className="text-xs font-light text-gray-900 focus-within:ring-0 focus-within:border-none border border-gray-300 bg-gray-50 rounded">
				<option value="">Sort By Amount(Highest)</option>
				<option value="">Sort By Amount(Lowest)</option>
				<option value="">Sort By Date(Recent)</option>
				<option value="">Sort By Date(Lowest)</option>
			</select> */}
		</>
	);
};

export default TicketHeaderActions;
