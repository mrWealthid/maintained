'use client';

import React, { FC, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { TECHNICIAN_RESPONSE, TICKET_STATUS } from '@/app/shared/enums/enums';
import { getStatusColor } from '@/utils/helper';
import {
	TicketFilterQuery,
	TicketQueryprops
} from '@/app/shared/ticket-feat/model/ticket.model';
import { technicianListFilter } from '@/app/shared/ticket-feat/data/data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
const TicketHeaderActions: FC<TicketQueryprops<TECHNICIAN_RESPONSE>> = ({
	handleFilter
}) => {
	const [query, setQuery] =
		useState<TicketFilterQuery<TECHNICIAN_RESPONSE> | null>({
			status: TECHNICIAN_RESPONSE.pending
		});

	async function handleClick(
		query: TicketFilterQuery<TECHNICIAN_RESPONSE> | null
	) {
		setQuery(query);
		handleFilter?.(query);
	}

	return (
		<>
			<Tabs
				value={query?.status ?? TECHNICIAN_RESPONSE.all}
				onValueChange={(val) =>
					handleClick(
						val === TECHNICIAN_RESPONSE.all
							? null
							: { status: val as TECHNICIAN_RESPONSE }
					)
				}
				className='w-auto'>
				<TabsList className='bg-muted p-1 rounded-full shadow-sm space-x-1'>
					{technicianListFilter.map((tab) => (
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
