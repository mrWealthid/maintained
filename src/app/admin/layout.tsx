import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import Header from '@/app/shared/components/header/Header';

import Breadcrumbs from '@/app/shared/components/breadcrumbs/BreadCrumbs';
import { adminCrumbLabelMap } from '@/app/shared/data/data';

import { AppSidebar } from '../shared/components/sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { adminRoutes } from '@/app/shared/routes/routes';
import { AppProvider } from '../shared/contexts/AppContext';
import { getVerifiedUser } from '@/lib/auth/getVerifiedUser';

export default async function DashboardLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const verify = await getVerifiedUser();

	if (!verify) {
		redirect('/auth/login');
	}

	return (
		<section className='min-h-screen'>
			<SidebarProvider>
				<AppSidebar routes={adminRoutes} />
				<section className='flex flex-col overflow-x-hidden w-full gap-6'>
					<header className='flex p-2 bg-card border-b items-center justify-between w-full'>
						<SidebarTrigger />
						<Header />
					</header>
					<section className='container-text'>
						<Breadcrumbs crumbLabelMap={adminCrumbLabelMap} />
						<AppProvider>{children}</AppProvider>
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
