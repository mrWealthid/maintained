'use client';

import React, { FC, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { TICKET_STATUS } from '@/shared/enums/enums';
import { getStatusColor } from '@/utils/helper';
import {
	TicketFilterQuery,
	TicketQueryprops
} from '@/shared/ticket-feat/model/ticket.model';
import { ticketListFilter } from '@/shared/ticket-feat/data/data';

const TicketHeaderActions: FC<TicketQueryprops> = ({ handleFilter }) => {
	const [query, setQuery] = useState<TicketFilterQuery | null>({
		status: TICKET_STATUS.pending_assignment
	});

	async function handleClick(query: TicketFilterQuery | null) {
		setQuery(query);
		if (handleFilter) {
			query ? handleFilter(query) : handleFilter(null);
		}
	}

	function renderStyle(tab: { label: string; value: TICKET_STATUS }) {
		if (tab.value === TICKET_STATUS.all && !query) {
			return `bg-background`;
		} else if (query?.status === tab.value) {
			return `bg-background`;
		}
	}

	return (
		<>
			{ticketListFilter.map((tab) => (
				<div key={tab.label}>
					<button
						onClick={() =>
							handleClick(
								tab.value === TICKET_STATUS.all
									? null
									: { status: tab.value }
							)
						}
						type='button'
						className={`${renderStyle(
							tab
						)} w-full  text-xs px-6 py-2 flex gap-1 items-center rounded-3xl   font-light  border btn`}>
						<FaCircle
							size={10}
							color={getStatusColor([tab.value])}
						/>
						{tab.label}
					</button>
				</div>
			))}

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
