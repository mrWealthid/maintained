import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import { routes } from '@/app/shared/routes/routes';
import Header from '@/app/shared/components/header/Header';
import Breadcrumbs from '@/app/shared/components/breadcrumbs/BreadCrumbs';
import { crumbLabelMap } from '@/app/shared/data/data';

import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { get } from 'http';
import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import { AppProvider } from '../shared/contexts/AppContext';

export default async function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = await getUserFromCookies();

	const isUser = verify?.isUserRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<SidebarProvider>
				<header className='flex pl-2 bg-card items-center fixed top-0 w-full'>
					<SidebarTrigger />
					<Header />
				</header>
				<AppSidebar routes={routes} />
				<section className='flex flex-col dashboard-body overflow-x-hidden  w-full gap-6'>
					<section className='container-text'>
						<Breadcrumbs crumbLabelMap={crumbLabelMap} />
						<AppProvider>{isUser}</AppProvider>
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
