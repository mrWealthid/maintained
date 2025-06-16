import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import Header from '../shared/components/header/Header';
import SideBar from '../shared/components/sidebar/SideBarComponent';
import { adminRoutes } from '../shared/routes';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();
	const isAdmin = verify?.isAdminRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<header>
				<Header />
			</header>
			<section>
				<SideBar routes={adminRoutes} />
			</section>

			<section className=' sm:ml-64 flex flex-col h-screen gap-6 '>
				<section className='container-text mt-5 '>{isAdmin}</section>
			</section>
		</section>
	);
}
