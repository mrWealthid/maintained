
import { UserRowProps } from '@/app/shared/model/model';
import UserRowAction from './UserRowAction';

function UserRow({ data }:UserRowProps) {
	// function getStatusColor(val: string): string {
	// 	let style = '';
	// 	if (val === REQUEST_STATUS.pending) {
	// 		style = 'bg-pending text-white';
	// 	}
	// 	if (val === REQUEST_STATUS.assigned) {
	// 		style = 'bg-success text-white';
	// 	}
	// 	if (val === 'CHECKED_OUT') {
	// 		style = 'bg-gray-300';
	// 	}

	// 	if (val === REQUEST_STATUS.completed) {
	// 		style = 'bg-success text-white';
	// 	}
	// 	return style;
	// }

	return (
		<>
			{data?.map((row: any, i: any) => {
				return (
					<tr
						key={i}
						className='dark:border-none dark:text-white text-secondary relative border-b '>
						{/* <td className="p-2 font-medium md:px-2 md:py-4 whitespace-nowrap">
							<input
								title="check"
								id="checkbox-all-search"
								type="checkbox"
								className="w-4 h-4 m-0 border-gray-300 rounded focus:ring-gray-500 "
							/>
							<label
								htmlFor="checkbox-all-search text-sm"
								className="sr-only">
								#
							</label>
						</td> */}
						<td className='p-2 font-medium md:px-2 md:py-4 whitespace-nowrap'>
							<span>{i + 1}.</span>
						</td>
						{/* <td>
							<span
								title={row.title}
								className='block  ellipsis-overflow'>
								{row.title}
							</span>
						</td> */}
						<td>
							<span
								title={row.name}
								className={
									'text-sm font-semibold block ellipsis-overflow  mb-1  rounded-3xl'
								}>
								{row.name}
							</span>
							<span
								title={row.business?.businessName}
								className={'ellipsis-overflow text-xs block'}>
								{row.business?.businessName}
							</span>
						</td>

						<td>
							<span
								title={row.email}
								className='block  ellipsis-overflow'>
								{row.email}
							</span>
						</td>
						<td>
							<span
								className=' block ellipsis-overflow'
								title={row.business.country}>
								{row.business.country}
							</span>
						</td>
						<td>
							<span
								className=' block ellipsis-overflow'
								title={row.status}>
								{row.status}
							</span>
						</td>
						<td>
							<span
								className=' block ellipsis-overflow'
								title={row.role}>
								{row.role}
							</span>
						</td>

						<UserRowAction user={row} />
					</tr>
				);
			})}
		</>
	);
}

export default UserRow;
