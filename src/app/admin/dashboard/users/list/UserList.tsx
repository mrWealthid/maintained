'use client';
import { Icolumn } from '@/components/table/models/table.model';
import Table from '@/components/table/Table';
import React from 'react';
import { fetchUsers } from '../service/user.service';
import UserHeaderActions from './UserHeaderActions';
import UserRow from './UserRow';
import { INVITE_STATUS, ROLE_STATUS } from '@/utils/enums';

const UserList = () => {
	const columns: Icolumn[] = [
		{
			header: 'name',
			accessor: 'name',
			searchType: 'TEXT',
			filterKey: 'name'
		},
		{ header: 'email', accessor: 'email' },
		{ header: 'Nationality', accessor: 'business.country' },
		{
			header: 'Invite Status',
			accessor: 'status',
			searchType: 'DROPDOWN',
			filterKey: 'status',
			selectOptions: [
				{ name: 'invited', value: INVITE_STATUS.invited },
				{ name: 'activated', value: INVITE_STATUS.activated },
				{ name: 'declined', value: INVITE_STATUS.declined }
			]
		},
		{
			header: 'role',
			accessor: 'role',
			searchType: 'DROPDOWN',
			filterKey: 'role',
			selectOptions: [
				{ name: 'admin', value: ROLE_STATUS.admin },
				{ name: 'user', value: ROLE_STATUS.user }
			]
		}
	];

	return (
		<Table
			headerActions={<UserHeaderActions />}
			service={fetchUsers}
			defaultParams={{ status: INVITE_STATUS.invited }}
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
