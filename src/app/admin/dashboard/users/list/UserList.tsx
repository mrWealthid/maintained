'use client';

import React from 'react';
import { fetchUsers } from '../service/user.service';
import UserHeaderActions from './UserHeaderActions';
import UserRow from './UserRow';
import { INVITE_STATUS, ROLES } from '@/shared/enums/enums';
import { TableColumn } from '@/shared/components/table/models/table.model';
import { User } from '@/shared/model/model';
import TableComponent from '@/shared/components/table/Table';

const UserList = () => {
	const columns: TableColumn[] = [
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
		<TableComponent<User>
			headerActions={<UserHeaderActions />}
			service={fetchUsers}
			defaultParams={{ status: INVITE_STATUS.invited }}
			searchKey='name'
			queryKey='Users'
			columns={columns}>
			<TableComponent.TableHeader />
			<TableComponent.TableRow customRow={true}>
				<UserRow />
			</TableComponent.TableRow>
		</TableComponent>
	);
};

export default UserList;
