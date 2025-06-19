import React, { FC } from 'react';
import { CiSearch } from 'react-icons/ci';

const Search: FC<SearchProps> = ({ placeHolder, handleSearch }) => {
	return (
		<div className='flex bg-white border py-1 flex-1 cursor-pointer items-center pl-3  rounded-3xl overflow-hidden'>
			<label htmlFor='search' className='cursor-pointer'>
				<CiSearch size={15} color={'gray'} />
			</label>
			<input
				type='search'
				id='search'
				name={'search'}
				className='w-full px-2 cursor-pointer  dark:bg-transparent   border-none outline-none focus:ring-0 ring-0 '
				onChange={(e) => handleSearch(e.target.value)}
				placeholder={placeHolder}
			/>
		</div>
	);
};

export default Search;

interface SearchProps {
	placeHolder: string;
	handleSearch: (val: string) => void;
}
