'use client';
import { Icolumn } from '@/components/Table/models/table.model';
import Table from '@/components/Table/Table';
import React from 'react';
import { fetchUsers } from '../service/user.service';
import UserHeaderActions from './UserHeaderActions';
import UserRow from './UserRow';

const UserList = () => {
	const columns: Icolumn[] = [
		// { header: 'image', accessor: 'image' },
		{ header: 'name', accessor: 'name', searchType: 'TEXT' },
		{ header: 'email', accessor: 'email' },
		{
			header: 'role',
			accessor: 'role',
			custom: { type: 'style' }
		},
		{ header: 'Nationality', accessor: 'business.country' }
	];

	return (
		<Table
			headerActions={<UserHeaderActions />}
			service={fetchUsers}
			// actionable={false}

			queryKey='users'
			columns={columns}>
			<Table.TableHeader />
			<Table.TableRow customRow={true}>
				<UserRow />
			</Table.TableRow>
		</Table>
	);
};

export default UserList;
