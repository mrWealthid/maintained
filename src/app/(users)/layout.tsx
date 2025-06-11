import MiddlewareFeatures from '@/middlewareFeatures';
import SideBar from '../(users)/dashboard/SideBarComponent';
import Header from '@/components/shared/header/Header';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();

	const isUser = verify?.isUserRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<header className='dashboard-header sticky top-0 w-full'>
				<Header />
			</header>
			<section>
				<SideBar />
			</section>

			<section className=' sm:ml-64 flex flex-col h-screen gap-6 '>
				<section className='container-text mt-5 '>{isUser}</section>
			</section>
		</section>
	);
}
