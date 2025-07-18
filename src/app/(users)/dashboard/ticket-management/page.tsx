'use client';
import { useState } from 'react';
import TicketList from '@/app/admin/dashboard/ticket-management/list/TicketList';
import ToggleView from '@/app/shared/components/toggle-views/ToggleView';
import TicketComponent from '@/app/shared/ticket-feat/pages/TicketComponent';
import Link from 'next/link';
import { CiCirclePlus } from 'react-icons/ci';
import TransitionReveal from '@/app/shared/components/animation/TransitionReveal';

export default function Home() {
	const [isList, setIsList] = useState(false);

	function handleChangeView(val: boolean) {
		setIsList(val);
	}

	return (
		<section className='flex  gap-6 flex-col '>
			<h1 className='title'> Maintenance Requests </h1>
			<section className='flex flex-col gap-2  w-full  items-end'>
				<div>
					<Link
						className='btn-primary bg-card flex items-center gap-1 rounded-3xl'
						href={'ticket-management/manage'}>
						<CiCirclePlus size={18} />
						Create Ticket
					</Link>
				</div>

				<ToggleView
					isList={isList}
					handleChangeView={handleChangeView}
				/>
			</section>
			{isList ? (
				<TransitionReveal keyId='list'>
					<TicketList />
				</TransitionReveal>
			) : (
				<TransitionReveal keyId='tile'>
					<TicketComponent />
				</TransitionReveal>
			)}
		</section>
	);
}
