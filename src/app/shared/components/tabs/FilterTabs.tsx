'use client';
import React, { FC } from 'react';
import { TICKET_STATUS } from '@/utils/enums';
import { ButtonGroupTabsProps } from '@/app/shared/model/model';

const FilterTabs: FC<ButtonGroupTabsProps<TICKET_STATUS>> = ({
	handleClick,
	status,
	data
}) => {
	return (
		<section className='flex flex-1 items-center -space-x-4 flex-wrap justify-end'>
			{data.map((tab) => (
				<div
					key={tab.label}
					className={`${status === tab.value && '!z-10'}`}>
					<button
						onClick={() => handleClick(tab.value)}
						type='button'
						className={`${
							status === tab.value &&
							'!bg-primary text-white z-10'
						} w-full  text-xs px-6 py-2 rounded-3xl  dark:border-none   transition-all duration-500 bg-gray-50 dark:glass font-light text-black  dark:text-white border btn`}>
						{tab.label}
					</button>
				</div>
			))}
		</section>
	);
};

export default FilterTabs;
