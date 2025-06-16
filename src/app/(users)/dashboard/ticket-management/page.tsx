import TicketComponent from '@/app/shared/components/ui/ticket/TicketComponent';
import Link from 'next/link';
import { CiCirclePlus } from 'react-icons/ci';

export default function Home() {
	return (
		<main className='flex min-h-screen gap-6 flex-col '>
			<h1 className='title'> Maintenance Requests </h1>{' '}
			<section className='flex w-full justify-end'>
				<div>
					<button
						type='button'
						className='btn-primary flex items-center gap-1 rounded-3xl'>
						<CiCirclePlus size={18} />
						<Link href={'maintenance-request/manage'}>
							Make Request
						</Link>
					</button>
				</div>
			</section>
			<TicketComponent />
		</main>
	);
}
