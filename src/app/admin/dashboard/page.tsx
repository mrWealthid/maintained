import TicketComponent from '@/app/shared/ticket-feat/pages/TicketComponent';
import MiddlewareFeatures from '@/middlewareFeatures';

export default function Home() {
	const verify = new MiddlewareFeatures().verifyToken();
	console.log(verify);
	return (
		<main className='flex min-h-screen gap-6 flex-col'>
			<section className='flex w-full justify-between'>
				<p className='border first-letter:text-blue-700 first-letter:text-xl border-gray-50 p-2 rounded-lg'>
					Maintained
				</p>
			</section>
			<TicketComponent role={verify.userInfo.role} />
		</main>
	);
}
