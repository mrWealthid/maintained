import React, { FC } from 'react';
import { CiSearch } from 'react-icons/ci';

const Search: FC<SearchProps> = ({ placeHolder, handleSearch }) => {
	return (
		<div className='flex bg-card dark:bg-transparent flex-1  border  cursor-pointer items-center pl-3  rounded-3xl overflow-hidden'>
			<label htmlFor='search' className='cursor-pointer'>
				<CiSearch size={15} color={'gray'} />
			</label>
			<input
				type='search'
				id='search'
				name={'search'}
				className='w-full bg-transparent  py-2  px-2 cursor-pointer     border-none outline-none focus:ring-0 ring-0 '
				onChange={(e) => handleSearch(e.target.value)}
				placeholder={placeHolder}
				autoFocus
			/>
		</div>
	);
};

export default Search;

interface SearchProps {
	placeHolder: string;
	handleSearch: (val: string) => void;
}
