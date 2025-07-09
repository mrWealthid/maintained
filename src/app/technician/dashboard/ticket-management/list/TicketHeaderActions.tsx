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
		if (handleFilter) {
			query ? handleFilter(query) : handleFilter(null);
		}
	}

	function renderStyle(tab: { label: string; value: TECHNICIAN_RESPONSE }) {
		if (tab.value === TECHNICIAN_RESPONSE.all && !query) {
			return `bg-background`;
		} else if (query?.status === tab.value) {
			return `bg-background`;
		}
	}

	return (
		<>
			{technicianListFilter.map((tab) => (
				<div key={tab.label}>
					<button
						onClick={() =>
							handleClick(
								tab.value === 'ALL'
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
