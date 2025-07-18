import React, { FC } from 'react';
import { FaCircle } from 'react-icons/fa';
import { getStatusColor } from '@/utils/helper';
import { CiUser } from 'react-icons/ci';
import { Ticket } from '@/app/shared/model/model';
import Modal from '@/app/shared/components/modal/Modal';

import { TicketActions } from './TicketActions';

const TicketCard: FC<{ ticket: Ticket }> = ({ ticket }) => {
	const { id, title, description, status, user, area, category, createdAt } =
		ticket;

	return (
		<section className='request-card w-full border'>
			<div className='flex items-center flex-wrap justify-between w-full text-xs'>
				<section className='flex gap-5 items-center'>
					<time className='text-gray-500 dark:text-white'>
						<p>{new Date(createdAt).toLocaleDateString()}</p>
					</time>
					<span title={area} className='request-card__details'>
						{area}
					</span>
				</section>

				<section>
					<span className='request-card__details '>
						<FaCircle color={`${getStatusColor(status)}`} />
						{status}
					</span>

					{/* {status} */}
				</section>
			</div>

			<div className='group'>
				<h3
					title={title}
					className='mt-3 text-lg font-semibold title leading-6   dark:group-hover:text-white '>
					{title}
				</h3>
				<p className='mt-5 line-clamp-3 description text-sm leading-6 '>
					{description}
				</p>
			</div>

			<div className='w-full mt-8 flex  flex-wrap text-xs justify-between items-center gap-x-4'>
				<span className='request-card__details'>
					<CiUser />
					<span className='ellipsis-overflow'>{user.name}</span>
				</span>
				<span
					title={'category:' + category.name}
					className='request-card__details'>
					<i className='fa-regular fa-user'></i>
					<span className='ellipsis-overflow'>{category.name}</span>
				</span>

				<section className='flex gap-2 items-center text-xs'>
					<Modal>
						<TicketActions ticket={ticket} />
					</Modal>
				</section>
			</div>
		</section>
	);
};

export default TicketCard;
