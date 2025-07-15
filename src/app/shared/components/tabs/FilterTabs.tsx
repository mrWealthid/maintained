'use client';
import React, { FC } from 'react';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { ButtonGroupTabsProps } from '@/app/shared/model/model';
import { ticketListFilter } from '../../ticket-feat/data/data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FilterTabs: FC<ButtonGroupTabsProps<TICKET_STATUS>> = ({
	handleClick,
	status,
	data
}) => {
	// return (
	// 	<section className='flex flex-1 items-center -space-x-4 flex-wrap justify-end'>
	// 		{ticketListFilter.map((tab) => (
	// 			<div key={tab.label}>
	// 				<button
	// 					onClick={() => handleClick(tab.value)}
	// 					type='button'
	// 					className={`${
	// 						status === tab.value
	// 							? 'bg-primary font-semibold'
	// 							: ''
	// 					} w-full  text-xs px-6 py-2 rounded-3xl  transition-all duration-500 border btn`}>
	// 					{tab.label}
	// 				</button>
	// 			</div>
	// 		))}
	// 	</section>
	// );

	// <section className='flex justify-end w-full'>
	// 	<ToggleGroup
	// 		type='single'
	// 		value={status}
	// 		onValueChange={(val) => {
	// 			if (val) handleClick(val as TICKET_STATUS);
	// 		}}
	// 		className='flex flex-wrap gap-2'>
	// 		{ticketListFilter.map((tab) => (
	// 			<ToggleGroupItem
	// 				key={tab.value}
	// 				value={tab.value}
	// 				className='rounded-3xl px-6 py-2 text-xs border transition-colors data-[state=on]:bg-primary data-[state=on]:text-white'>
	// 				{tab.label}
	// 			</ToggleGroupItem>
	// 		))}
	// 	</ToggleGroup>
	// </section>

	return (
		<section className='w-full flex flex-1 ml-5 justify-end'>
			<Tabs
				value={status}
				onValueChange={(val) => handleClick(val as TICKET_STATUS)}
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
		</section>
	);
};

export default FilterTabs;
