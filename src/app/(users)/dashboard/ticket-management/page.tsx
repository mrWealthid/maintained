import TicketComponent from '@/app/shared/ticket-feat/pages/TicketComponent';
import Link from 'next/link';
import { CiCirclePlus } from 'react-icons/ci';

export default function Home() {
	return (
		<main className='flex min-h-screen gap-6 flex-col '>
			<h1 className='title'> Maintenance Requests </h1>{' '}
			<section className='flex w-full justify-end'>
				<div>
					<Link
						className='btn-primary flex items-center gap-1 rounded-3xl'
						href={'ticket-management/manage'}>
						<CiCirclePlus size={18} />
						Create Ticket
					</Link>
				</div>
			</section>
			<TicketComponent />
		</main>
	);
}
