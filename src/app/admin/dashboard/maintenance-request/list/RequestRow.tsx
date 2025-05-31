import RequestRowActions from './RequestRowActions';
import { formatCurrency, getStatusColor } from '@/utils/helper';
import { REQUEST_STATUS } from '@/utils/enums';

function RequestRow({ data }: any) {
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
						className=' dark:border-none dark:text-white text-secondary relative border-b  '>
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
						<td>
							<span
								title={row.title}
								className='block  ellipsis-overflow'>
								{row.title}
							</span>
						</td>
						<td>
							<span
								title={row.user?.name}
								className={
									'text-sm font-semibold block ellipsis-overflow  mb-1  rounded-3xl'
								}>
								{row.user?.name}
							</span>
							{/* <span
								title={row.category?.name}
								className={' ellipsis-overflow text-xs block'}>
								{row.category?.name}
							</span> */}
						</td>

						<td>
							<span
								className=' block ellipsis-overflow'
								title={row.category?.name}>
								{row.category?.name}
							</span>
						</td>
						<td>
							<span
								className=' block ellipsis-overflow'
								title={row.area}>
								{row.area}
							</span>
						</td>
						<td>
							<span
								style={{
									backgroundColor: getStatusColor(row.status)
								}}
								className='text-[8px] md:text-xs text-primary py-2 px-3 rounded-3xl inline-flex'>
								{row.status}
							</span>
						</td>
						<td>
							<span className='flex justify-center gap-2 flex-col'>
								{/* <span className='font-bold'>
									{row.} Night(s)
								</span> */}

								<span
									title={new Date(
										row.createdAt
									).toDateString()}
									className='flex  text-xs  md:text-sm gap-1'>
									{/* <span>
										{new Date(row.startDate).toDateString()}{' '}
										➡️
									</span> */}

									{/* <span>
										{' '}
										{new Date(row.endDate).toDateString()}
									</span> */}
									{new Date(row.createdAt).toDateString()}
								</span>
							</span>
						</td>

						<RequestRowActions rowData={row} />
					</tr>
				);
			})}
		</>
	);
}

export default RequestRow;
