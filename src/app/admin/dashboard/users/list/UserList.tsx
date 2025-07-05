'use client';

import React from 'react';
import { fetchUsers } from '../service/user.service';
import UserHeaderActions from './UserHeaderActions';
import UserRow from './UserRow';
import { INVITE_STATUS, ROLES } from '@/app/shared/enums/enums';
import { Icolumn } from '@/app/shared/components/table/models/table.model';
import Table from '@/app/shared/components/table/Table';
import { User } from '@/app/shared/model/model';

const UserList = () => {
	const columns: Icolumn[] = [
		{
			header: 'name',
			accessor: 'name',
			searchType: 'TEXT',
			filterKey: 'name',
			colspan: 2
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
				{ name: 'admin', value: ROLES.admin },
				{ name: 'user', value: ROLES.user }
			]
		}
	];

	return (
		<Table<User>
			headerActions={<UserHeaderActions />}
			service={fetchUsers}
			defaultParams={{ status: INVITE_STATUS.invited }}
			searchKey='name'
			queryKey='Users'
			columns={columns}>
			<Table.TableHeader />
			<Table.TableRow customRow={true}>
				<UserRow />
			</Table.TableRow>
		</Table>
	);
};

export default UserList;
