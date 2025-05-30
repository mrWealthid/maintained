import MaintenanceComponent from '@/components/ui/MaintenanceComponent';

export default function Home() {
	function handleClick(val: number) {}

	return (
		<main className='flex min-h-screen gap-6 flex-col'>
			<section className='flex w-full justify-between'>
				<p className='border first-letter:text-blue-700 first-letter:text-xl border-gray-50 p-2 rounded-lg'>
					Maintained
				</p>


			</section>
			<MaintenanceComponent />
		</main>
	);
}
