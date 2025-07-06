import { UserRowProps } from '@/app/shared/model/model';
import UserRowAction from './UserRowAction';
import Modal from '@/app/shared/components/modal/Modal';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function UserRow({ data }: UserRowProps) {
	return (
		<>
			{data?.map((row, i) => {
				return (
					<TableRow key={row._id} className='  relative border-b '>
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
						<TableCell className='font-medium  whitespace-nowrap'>
							<span>{i + 1}.</span>
						</TableCell>
						{/* <td>
							<span
								title={row.title}
								className='block  ellipsis-overflow'>
								{row.title}
							</span>
						</td> */}
						<TableCell colSpan={2}>
							<span
								title={row.name}
								className={
									'text-sm font-semibold block   mb-1  rounded-3xl'
								}>
								{row.name}
							</span>
							<span
								title={row.business?.businessName}
								className={' text-xs block'}>
								{row.business?.businessName}
							</span>
						</TableCell>

						<TableCell>
							<span title={row.email} className='block  '>
								{row.email}
							</span>
						</TableCell>
						<TableCell>
							<span
								className=' block ellipsis-overflow'
								title={row.business.country}>
								{row.business.country}
							</span>
						</TableCell>
						<TableCell>
							<Badge variant='outline'>
								{row.status}
								{/*
								<IconLoader/> */}
							</Badge>
						</TableCell>
						<TableCell>
							<span
								className=' block ellipsis-overflow'
								title={row.role}>
								{row.role}
							</span>
						</TableCell>
						<Modal>
							<UserRowAction user={row} />
						</Modal>
					</TableRow>
				);
			})}
		</>
	);
}

export default UserRow;
