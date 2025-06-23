'use client';

import React, { FC, useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { GetColorObject } from '@/utils/helper';
import {
	TicketFilterQuery,
	TicketQueryprops
} from '@/app/shared/ticket-feat/model/ticket.model';

const TicketHeaderActions: FC<TicketQueryprops> = ({ handleFilter }) => {
	const [query, setQuery] = useState<TicketFilterQuery | null>({
		status: TICKET_STATUS.pending
	});

	async function handleClick(query: TicketFilterQuery | null) {
		setQuery(query);
		if (handleFilter) {
			query ? handleFilter(query) : handleFilter(null);
		}
	}

	// const [query, setQuery] = useState<BookingFilterQuery | null>(null);

	const colorObj = GetColorObject();

	return (
		<>
			<div className=''>
				<button
					onClick={() => handleClick(null)}
					type='button'
					className={`${
						query ?? '!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl   dark:glass dark:border-none bg-gray-50 font-light text-black border btn`}>
					All
				</button>
			</div>

			<div className=''>
				<button
					onClick={() =>
						handleClick({ status: TICKET_STATUS.pending })
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.pending &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex gap-1 items-center rounded-3xl  bg-gray-50  dark:glass dark:border-none font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.pending]} />
					Pending
				</button>
			</div>
			<div className=''>
				<button
					onClick={() =>
						handleClick({ status: TICKET_STATUS.processing })
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.processing &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex gap-1 items-center rounded-3xl  bg-gray-50  dark:glass dark:border-none font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.processing]} />
					Processing
				</button>
			</div>
			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: TICKET_STATUS.assigned
						})
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.assigned &&
						'!bg-primary text-white'
					} w-full flex gap-1 items-center  text-xs px-6 py-2 rounded-3xl  dark:glass dark:border-none bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.assigned]} />
					Assigned
				</button>
			</div>
			<div className=''>
				<button
					onClick={() =>
						handleClick({ status: TICKET_STATUS.scheduled })
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.scheduled &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex gap-1 items-center rounded-3xl  bg-gray-50  dark:glass dark:border-none font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.scheduled]} />
					Processing
				</button>
			</div>

			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: TICKET_STATUS.completed
						})
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.completed &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex items-center gap-1 rounded-3xl  dark:glass dark:border-none  bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.completed]} />
					Completed
				</button>
			</div>

			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: TICKET_STATUS.declined
						})
					}
					type='button'
					className={`${
						query?.status === TICKET_STATUS.declined &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex items-center gap-1 rounded-3xl  dark:glass dark:border-none  bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[TICKET_STATUS.declined]} />
					Declined
				</button>
			</div>
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
