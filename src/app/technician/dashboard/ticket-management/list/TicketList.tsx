'use client';
import { Icolumn } from '@/app/shared/components/table/models/table.model';
import RequestRow from './TicketRow';
import { TICKET_STATUS } from '@/app/shared/enums/enums';
import { FC } from 'react';
import { fetchTicketList } from '@/app/shared/ticket-feat/service/ticket-service';
import TableComponent from '@/app/shared/components/table/Table';
import { CreateTicketPayload, Ticket } from '@/app/shared/model/model';
import TicketHeaderActions from './TicketHeaderActions';
import { TicketListFilter } from '@/app/shared/ticket-feat/model/ticket.model';

const TicketList: FC = () => {
	const columns: Icolumn[] = [
		{
			header: 'Title',
			accessor: 'title',
			filterKey: 'title',
			searchType: 'TEXT'
		},
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
			<TableComponent<Ticket>
				service={fetchTicketList}
				queryKey='tickets'
				searchKey='title'
				defaultParams={{ status: TICKET_STATUS.pending_assignment }}
				headerActions={<TicketHeaderActions />}
				columns={columns}>
				<TableComponent.TableHeader />
				<TableComponent.TableRow customRow={true}>
					<RequestRow />
				</TableComponent.TableRow>
			</TableComponent>
		</div>
	);
};

export default TicketList;
