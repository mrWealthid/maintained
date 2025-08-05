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
		// <section className='min-h-screen'>
		// 	<SidebarProvider>
		// 		<AppSidebar routes={adminRoutes} />
		// 		<section className='flex min-h-screen flex-col overflow-x-hidden w-full gap-6'>
		// 			<header className='sticky p-2  flex items-center justify-between top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90'>
		// 				<SidebarTrigger />
		// 				<Header />
		// 			</header>

		// 			<section className='overflow-y-auto container-text'>
		// 				<Breadcrumbs crumbLabelMap={adminCrumbLabelMap} />
		// 				<AppProvider>{children}</AppProvider>
		// 			</section>
		// 		</section>
		// 	</SidebarProvider>
		// </section>

		<section className='min-h-screen flex'>
			<SidebarProvider>
				<AppSidebar routes={adminRoutes} />

				{/* Main Content Area */}
				<section className='flex flex-col w-full'>
					{/* Sticky Header */}
					<header className='sticky top-0 z-50 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90'>
						<SidebarTrigger />
						<Header />
					</header>

					{/* Scrollable Content */}
					<section className='overflow-y-auto flex-1 px-4 py-6'>
						<Breadcrumbs crumbLabelMap={adminCrumbLabelMap} />
						<AppProvider>{children}</AppProvider>
					</section>
				</section>
			</SidebarProvider>
		</section>
	);
}
