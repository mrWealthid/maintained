'use client';
import { TableColumn } from '@/app/shared/components/table/models/table.model';
import RequestRow from './TicketRow';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { FC } from 'react';
import { fetchTicketList } from '@/app/shared/ticket-feat/service/ticket-service';
import Table from '@/app/shared/components/table/Table';
import { Ticket } from '@/app/shared/model/model';
import TicketHeaderActions from './TicketHeaderActions';
import TableComponent from '@/app/shared/components/table/Table';

const TicketList: FC = () => {
	const columns: TableColumn[] = [
		{
			header: 'Title',
			accessor: 'title',
			filterKey: 'title',
			searchType: 'TEXT',
			colspan: 3
		},
		{
			header: 'user',
			accessor: 'user.name',
			searchType: 'TEXT',
			filterKey: 'user',
			colspan: 2
		},
		{ header: 'category', accessor: 'category.name', searchType: 'TEXT' },
		{ header: 'area', accessor: 'area', searchType: 'TEXT' },
		{
			header: 'status',
			accessor: 'status',
			searchType: 'DROPDOWN',
			filterKey: 'status',
			selectOptions: [
				{ name: 'pending', value: TICKET_STATUS.pending },
				{ name: 'assigned', value: TICKET_STATUS.assigned },
				{ name: 'completed', value: TICKET_STATUS.completed },
				{ name: 'declined', value: TICKET_STATUS.declined }
			]
		},

		{
			header: 'Date',
			accessor: ''
		}
	];

	return (
		<div className='h-80'>
			<TableComponent<Ticket>
				service={fetchTicketList}
				queryKey='tickets'
				searchKey='title'
				defaultParams={{ status: TICKET_STATUS.pending }}
				headerActions={<TicketHeaderActions />}
				columns={columns}>
				<Table.TableHeader />
				<Table.TableRow customRow={true}>
					<RequestRow />
				</Table.TableRow>
			</TableComponent>
		</div>
	);
};

export default TicketList;
