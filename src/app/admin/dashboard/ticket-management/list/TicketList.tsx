'use client';
import { Icolumn } from '@/app/shared/components/table/models/table.model';
import RequestHeaderActions from './TicketHeaderActions';
import RequestRow from './TicketRow';
import { TICKET_STATUS } from '@/utils/enums';
import { FC } from 'react';
import { fetchTicketList } from '@/app/shared/ticket-feat/service/ticket-service';
import Table from '@/app/shared/components/table/Table';
import { Ticket } from '@/app/shared/model/model';

const RequestsList: FC = () => {
	const columns: Icolumn[] = [
		{ header: 'Title', accessor: 'title', searchType: 'TEXT' },
		{
			header: 'user',
			accessor: 'user.name',
			searchType: 'TEXT',
			filterKey: 'user'
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
			<Table<Ticket>
				service={fetchTicketList}
				queryKey='requests'
				headerActions={<RequestHeaderActions />}
				columns={columns}>
				<Table.TableHeader />
				<Table.TableRow customRow={true}>
					<RequestRow />
				</Table.TableRow>
			</Table>
		</div>
	);
};

export default RequestsList;
