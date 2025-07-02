import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import Header from '../shared/components/header/Header';

import Breadcrumbs from '../shared/components/breadcrumbs/BreadCrumbs';
import { adminCrumbLabelMap } from '../shared/data/data';

import { AppSidebar } from '../(users)/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { adminRoutes } from '../shared/routes/routes';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();
	const isAdmin = verify?.isAdminRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<header className='flex pl-2 bg-card items-center fixed top-0 w-full'>
				<SidebarTrigger />
				<Header />
			</header>
			<SidebarProvider>
				<AppSidebar routes={adminRoutes} />

				<section className='mt-10 flex flex-col dashboard-body w-full gap-6'>
					<section className='container-text mt-14'>
						<Breadcrumbs crumbLabelMap={adminCrumbLabelMap} />
						{isAdmin}
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
