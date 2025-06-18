'use client';
import React from 'react';
import { TICKET_STATUS } from '@/utils/enums';

const Tabs = ({ handleClick, status }: any) => {
	return (
		<section className='flex items-center -space-x-4  flex-wrap justify-end'>
			<div className={`${status === TICKET_STATUS.all && '!z-10'}`}>
				<button
					onClick={() => handleClick(TICKET_STATUS.all)}
					type='button'
					className={`${
						status === TICKET_STATUS.all &&
						'!bg-primary text-white z-10'
					} w-full  text-xs px-6 py-2 rounded-3xl  dark:border-none   transition-all duration-500 bg-gray-50 dark:glass font-light text-black  dark:text-white border btn`}>
					All
				</button>
			</div>
			<div className={`${status === TICKET_STATUS.pending && '!z-10'}`}>
				<button
					onClick={() => handleClick(TICKET_STATUS.pending)}
					type='button'
					className={`${
						status === TICKET_STATUS.pending &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl transition-colors duration-1000 ease-in-out  dark:border-none  bg-gray-50 dark:glass font-light text-black  dark:text-white border btn`}>
					Pending
				</button>
			</div>

			<div className={`${status === TICKET_STATUS.assigned && '!z-10'}`}>
				<button
					onClick={() => handleClick(TICKET_STATUS.assigned)}
					type='button'
					className={`${
						status === TICKET_STATUS.assigned &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl  transition-colors duration-1000 ease-in-out  dark:border-none  bg-gray-50 dark:glass font-light text-black dark:text-white border btn`}>
					Assigned
				</button>
			</div>
			<div className={`${status === TICKET_STATUS.declined && '!z-10'}`}>
				<button
					onClick={() => handleClick(TICKET_STATUS.declined)}
					type='button'
					className={`${
						status === TICKET_STATUS.declined &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl dark:glass dark:border-none ease-in-out  transition-colors duration-1000 bg-gray-50 font-light text-black dark:text-white border btn`}>
					Declined
				</button>
			</div>
			<div className={`${status === TICKET_STATUS.completed && '!z-10'}`}>
				<button
					onClick={() => handleClick(TICKET_STATUS.completed)}
					type='button'
					className={`${
						status === TICKET_STATUS.completed &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl dark:glass transition-colors ease-in-out duration-1000 dark:border-none  bg-gray-50 font-light text-black dark:text-white border btn`}>
					Completed
				</button>
			</div>
		</section>
	);
};

export default Tabs;
