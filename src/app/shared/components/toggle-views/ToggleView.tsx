import React, { FC } from 'react';
import { CiViewTable } from 'react-icons/ci';
import { TfiViewGrid } from 'react-icons/tfi';

const ToggleView: FC<{
	handleChangeView: (val: boolean) => void;
	isList: boolean;
}> = ({ handleChangeView, isList }) => {
	return (
		<div className='flex items-center gap-2 border border-gray-300  rounded-3xl'>
			<button
				onClick={() => handleChangeView(false)}
				aria-label='Toggle Grid View'
				title='Toggle View'
				className={`p-2  text-primary dark:text-white rounded-full transition-all ${
					!isList ? 'glass ' : 'text-gray-500'
				}`}>
				<TfiViewGrid />
			</button>
			<button
				onClick={() => handleChangeView(true)}
				aria-label='Toggle List View'
				title='Toggle View'
				className={`p-2 text-primary dark:text-white rounded-full transition-all ${
					isList ? 'glass ' : 'text-gray-500'
				}`}>
				<CiViewTable />
			</button>
		</div>
	);
};

export default ToggleView;
