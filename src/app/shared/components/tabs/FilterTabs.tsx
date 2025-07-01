'use client';
import React, { FC } from 'react';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { ButtonGroupTabsProps } from '@/app/shared/model/model';

const FilterTabs: FC<ButtonGroupTabsProps<TICKET_STATUS>> = ({
	handleClick,
	status,
	data
}) => {
	return (
		<section className='flex flex-1 items-center -space-x-4 flex-wrap justify-end'>
			{data.map((tab) => (
				<div key={tab.label}>
					<button
						onClick={() => handleClick(tab.value)}
						type='button'
						className={`${
							status === tab.value
								? 'bg-primary font-semibold'
								: ''
						} w-full  text-xs px-6 py-2 rounded-3xl  transition-all duration-500 border btn`}>
						{tab.label}
					</button>
				</div>
			))}
		</section>
	);
};

export default FilterTabs;
