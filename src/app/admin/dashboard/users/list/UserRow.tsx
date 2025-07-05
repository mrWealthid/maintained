import { UserRowProps } from '@/app/shared/model/model';
import UserRowAction from './UserRowAction';
import Modal from '@/app/shared/components/modal/Modal';

function UserRow({ data }: UserRowProps) {
	return (
		<>
			{data?.map((row, i) => {
				return (
					<tr key={row._id} className='relative border-b '>
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
						<td className='w-1/3'>
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
						<Modal>
							<UserRowAction user={row} />
						</Modal>
					</tr>
				);
			})}
		</>
	);
}

export default UserRow;
