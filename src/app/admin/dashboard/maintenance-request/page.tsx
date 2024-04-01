import Link from 'next/link';
import MaintenanceComponent from '@/components/ui/MaintenanceComponent';
import { CiCirclePlus } from 'react-icons/ci';

export default function Home() {
	function handleClick(val: number) {}

	return (
		<main className='flex min-h-screen gap-6 flex-col '>
			<h1 className='title'> Maintenance Requests </h1>{' '}
			<section className='flex w-full justify-end'>
				{/* <p className='border first-letter:text-blue-700 first-letter:text-xl border-gray-50 p-2 rounded-lg'>
					Maintained
				</p> */}

				<div>
					<div>
						<button
							type='button'
							className='btn-primary flex items-center gap-1 rounded-3xl'>
							<CiCirclePlus size={18} />
							<Link href={'maintenance-request/add'}>
								Make Request
							</Link>
						</button>
					</div>
				</div>
			</section>
			<MaintenanceComponent />
		</main>
	);
}
