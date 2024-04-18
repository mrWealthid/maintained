'use client';
import Table from '@/components/Table/Table';
import RequestHeaderActions from './RequestHeaderActions';
import { Icolumn } from '@/components/Table/models/table.model';
import RequestRow from './RequestRow';
import { fetchMaintenanceRequestList } from '../service/maintenance-service';
import { REQUEST_STATUS } from '@/utils/enums';

const RequestsList = () => {
	// const cabins = await getData('/api/cabins', 'cabins', 'no-discount');

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
				{ name: 'pending', value: REQUEST_STATUS.pending },
				{ name: 'assigned', value: REQUEST_STATUS.assigned },
				{ name: 'completed', value: REQUEST_STATUS.completed },
				{ name: 'declined', value: REQUEST_STATUS.declined }
			]
		},

		{
			header: 'Date',
			accessor: ''
		}
	];

	return (
		<div className='h-80'>
			<Table
				service={fetchMaintenanceRequestList}
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
