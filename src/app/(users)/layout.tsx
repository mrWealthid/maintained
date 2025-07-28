import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import { routes } from '@/app/shared/routes/routes';
import Header from '@/app/shared/components/header/Header';
import Breadcrumbs from '@/app/shared/components/breadcrumbs/BreadCrumbs';
import { crumbLabelMap } from '@/app/shared/data/data';

import { AppSidebar } from '../shared/components/sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { get } from 'http';
import { getUserFromCookies } from '@/lib/auth/getUserFromCookies';
import { AppProvider } from '../shared/contexts/AppContext';

export default async function DashboardLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const verify = await getUserFromCookies();

	if (!verify?.isUserRole) {
		redirect('/auth/login');
	}

	return (
		<section className='min-h-screen'>
			<SidebarProvider>
				<AppSidebar routes={routes} />
				<section className='flex flex-col overflow-x-hidden w-full gap-6'>
					<header className='flex p-2 bg-card border-b items-center justify-between w-full'>
						<SidebarTrigger />
						<Header />
					</header>
					<section className='container-text'>
						<Breadcrumbs crumbLabelMap={crumbLabelMap} />
						<AppProvider>{children}</AppProvider>
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
