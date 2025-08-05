import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import { routes } from '@/app/shared/routes/routes';
import Header from '@/app/shared/components/header/Header';
import Breadcrumbs from '@/app/shared/components/breadcrumbs/BreadCrumbs';
import { crumbLabelMap } from '@/app/shared/data/data';

import { AppSidebar } from '../shared/components/sidebar/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { get } from 'http';
import { getVerifiedUser } from '@/lib/auth/getVerifiedUser';
import { AppProvider } from '../shared/contexts/AppContext';

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
		<section className='min-h-screen flex'>
			<SidebarProvider>
				<AppSidebar routes={routes} />
				<section className='flex flex-col overflow-x-hidden w-full gap-6'>
					<header className='sticky top-0 z-50 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90'>
						<SidebarTrigger />
						<Header />
					</header>
					<section className='overflow-y-auto flex-1 px-4 py-6'>
						<Breadcrumbs crumbLabelMap={crumbLabelMap} />
						<AppProvider>{children}</AppProvider>
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
