'use client';
import { TableColumn } from '@/app/shared/components/table/models/table.model';
import RequestRow from './TicketRow';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { FC } from 'react';
import {
	fetchRequestTicketList,
	fetchTicketList
} from '@/app/shared/ticket-feat/service/ticket-service';
import TableComponent from '@/app/shared/components/table/Table';
import { CreateTicketPayload, Ticket } from '@/app/shared/model/model';
import TicketHeaderActions from './TicketHeaderActions';
import { TicketListFilter } from '@/app/shared/ticket-feat/model/ticket.model';

const TicketList: FC = () => {
	const columns: TableColumn[] = [
		{
			header: 'Title',
			accessor: 'ticket.title',
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
		{
			header: 'category',
			accessor: 'ticket.category.name',
			searchType: 'TEXT'
		},
		{ header: 'area', accessor: 'ticket.area', searchType: 'TEXT' },
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
		<>
			<TableComponent<Ticket>
				service={fetchRequestTicketList}
				queryKey='tickets'
				searchKey='ticket.title'
				// defaultParams={{ status: TICKET_STATUS.pending_assignment }}
				headerActions={<TicketHeaderActions />}
				columns={columns}>
				<TableComponent.TableHeader />
				<TableComponent.TableRow customRow={true}>
					<RequestRow />
				</TableComponent.TableRow>
			</TableComponent>
		</>
	);
};

export default TicketList;
