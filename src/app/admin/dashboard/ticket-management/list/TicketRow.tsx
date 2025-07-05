import { TicketRowProps } from '@/app/shared/ticket-feat/model/ticket.model';
import { getStatusColor } from '@/utils/helper';
import TicketRowActions from './TicketRowActions';
import { Badge } from '@/components/ui/badge';

function RequestRow({ data }: TicketRowProps) {
	return (
		<>
			{data?.map((row, i) => {
				return (
					<tr key={row._id} className='relative border-b'>
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
						<td className='w-1/3'>
							<span title={row.title} className='block'>
								{row.title}
							</span>
						</td>
						<td className='w-1/5'>
							<span title={row.user?.name} className={' block '}>
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
							{/* <span
								style={{
									backgroundColor: getStatusColor(row.status)
								}}
								className='text-[8px] md:text-xs text-primary py-2 px-3 rounded-3xl inline-flex'>
								{row.status}
							</span> */}

							<Badge variant={'outline'}>{row.status}</Badge>
						</td>
						<td>
							<span className='flex justify-center gap-2 flex-col'>
								<span
									title={new Date(
										row.createdAt
									).toDateString()}
									className='flex   gap-1'>
									{new Date(row.createdAt).toDateString()}
								</span>
							</span>
						</td>

						<TicketRowActions ticket={row} />
					</tr>
				);
			})}
		</>
	);
}

export default RequestRow;
