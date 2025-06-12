'use client';
import React, { useState } from 'react';
import { REQUEST_STATUS } from '@/utils/enums';

const Tabs = ({ handleClick, status }: any) => {
	return (
		<section className='flex items-center -space-x-4  flex-wrap justify-end'>
			<div className={`${status === REQUEST_STATUS.all && '!z-50'}`}>
				<button
					onClick={() => handleClick(REQUEST_STATUS.all)}
					type='button'
					className={`${
						status === REQUEST_STATUS.all &&
						'!bg-primary text-white z-50'
					} w-full  text-xs px-6 py-2 rounded-3xl  dark:border-none   transition-all duration-500 bg-gray-50 dark:glass font-light text-black  dark:text-white border btn`}>
					Alls
				</button>
			</div>
			<div className={`${status === REQUEST_STATUS.pending && '!z-50'}`}>
				<button
					onClick={() => handleClick(REQUEST_STATUS.pending)}
					type='button'
					className={`${
						status === REQUEST_STATUS.pending &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl transition-colors duration-1000 ease-in-out  dark:border-none  bg-gray-50 dark:glass font-light text-black  dark:text-white border btn`}>
					Pending
				</button>
			</div>

			<div className={`${status === REQUEST_STATUS.assigned && '!z-50'}`}>
				<button
					onClick={() => handleClick(REQUEST_STATUS.assigned)}
					type='button'
					className={`${
						status === REQUEST_STATUS.assigned &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl  transition-colors duration-1000 ease-in-out  dark:border-none  bg-gray-50 dark:glass font-light text-black dark:text-white border btn`}>
					Assigned
				</button>
			</div>
			<div className={`${status === REQUEST_STATUS.declined && '!z-50'}`}>
				<button
					onClick={() => handleClick(REQUEST_STATUS.declined)}
					type='button'
					className={`${
						status === REQUEST_STATUS.declined &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl dark:glass dark:border-none ease-in-out  transition-colors duration-1000 bg-gray-50 font-light text-black dark:text-white border btn`}>
					Declined
				</button>
			</div>
			<div
				className={`${status === REQUEST_STATUS.completed && '!z-50'}`}>
				<button
					onClick={() => handleClick(REQUEST_STATUS.completed)}
					type='button'
					className={`${
						status === REQUEST_STATUS.completed &&
						'!bg-primary text-white'
					} w-full  text-xs px-6 py-2 rounded-3xl dark:glass transition-colors ease-in-out duration-1000 dark:border-none  bg-gray-50 font-light text-black dark:text-white border btn`}>
					Completed
				</button>
			</div>
		</section>
	);
};

export default Tabs;
