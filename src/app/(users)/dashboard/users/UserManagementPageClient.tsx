import React, { FC } from 'react';
import UserList from '@/features/team/list/UserList';
import AddUser from '@/features/team/components/AddUser';

const page: FC = () => {
	return (
		<div className='w-full flex flex-col gap-3'>
			<div className='flex items-center  justify-between'>
				<h1 className='title'> All Users </h1>

				<AddUser />
			</div>

			<UserList />
		</div>
	);
};

export default page;
