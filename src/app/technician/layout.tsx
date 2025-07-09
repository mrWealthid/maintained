import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import { technicianRoutes } from '@/app/shared/routes/routes';
import Header from '@/app/shared/components/header/Header';
import Breadcrumbs from '@/app/shared/components/breadcrumbs/BreadCrumbs';
import { technicianCrumbLabelMap } from '@/app/shared/data/data';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '../(users)/AppSidebar';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();

	const isUser = verify?.isTechnicianRole
		? children
		: redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<SidebarProvider>
				<header className='flex pl-2 bg-card items-center fixed top-0 w-full'>
					<SidebarTrigger />
					<Header />
				</header>
				<AppSidebar routes={technicianRoutes} />
				<section className='flex flex-col dashboard-body overflow-x-hidden  w-full gap-6'>
					<section className='container-text mt-14'>
						<Breadcrumbs crumbLabelMap={technicianCrumbLabelMap} />
						{isUser}
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
