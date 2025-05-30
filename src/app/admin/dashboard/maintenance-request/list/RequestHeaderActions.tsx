'use client';

import React, { useState } from 'react';
import { FaCircle } from 'react-icons/fa';
import { REQUEST_STATUS } from '@/utils/enums';
import { GetColorObject } from '@/utils/helper';

const RequestHeaderActions = ({ handleFilter }: any) => {
	const [query, setQuery] = useState<{
		status: string;
	} | null>({ status: REQUEST_STATUS.pending });

	async function handleClick(query: any) {
		setQuery(query);
		query ? handleFilter(query) : handleFilter(null);
	}

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
						handleClick({ status: REQUEST_STATUS.pending })
					}
					type='button'
					className={`${
						query?.status === REQUEST_STATUS.pending &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex gap-1 items-center rounded-3xl  bg-gray-50  dark:glass dark:border-none font-light text-black border btn`}>
					<FaCircle color={colorObj[REQUEST_STATUS.pending]} />
					Pending
				</button>
			</div>
			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: REQUEST_STATUS.assigned
						})
					}
					type='button'
					className={`${
						query?.status === REQUEST_STATUS.assigned &&
						'!bg-primary text-white'
					} w-full flex gap-1 items-center  text-xs px-6 py-2 rounded-3xl  dark:glass dark:border-none bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[REQUEST_STATUS.assigned]} />
					Assigned
				</button>
			</div>

			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: REQUEST_STATUS.completed
						})
					}
					type='button'
					className={`${
						query?.status === REQUEST_STATUS.completed &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex items-center gap-1 rounded-3xl  dark:glass dark:border-none  bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[REQUEST_STATUS.completed]} />
					Completed
				</button>
			</div>

			<div className=''>
				<button
					onClick={() =>
						handleClick({
							status: REQUEST_STATUS.declined
						})
					}
					type='button'
					className={`${
						query?.status === REQUEST_STATUS.declined &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 flex items-center gap-1 rounded-3xl  dark:glass dark:border-none  bg-gray-50 font-light text-black border btn`}>
					<FaCircle color={colorObj[REQUEST_STATUS.declined]} />
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

export default RequestHeaderActions;
