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
				className={`p-2    rounded-full transition-all ${
					!isList ? 'bg-secondary' : ''
				}`}>
				<TfiViewGrid />
			</button>
			<button
				onClick={() => handleChangeView(true)}
				aria-label='Toggle List View'
				title='Toggle View'
				className={`p-2   rounded-full transition-all ${
					isList ? 'bg-secondary' : ''
				}`}>
				<CiViewTable />
			</button>
		</div>
	);
};

export default ToggleView;
