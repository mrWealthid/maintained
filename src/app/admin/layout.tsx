import MiddlewareFeatures from '@/middlewareFeatures';
import { redirect } from 'next/navigation';
import Header from '../shared/components/header/Header';
import SideBar from '../shared/components/sidebar/SideBarComponent';
import { adminRoutes } from '../shared/routes/routes';
import Breadcrumbs from '../shared/components/breadcrumbs/BreadCrumbs';
import { adminCrumbLabelMap } from '../shared/data/data';
import {
	LayoutBody,
	LayoutProvider
} from '../shared/contexts/LayoutContextProvider';
import {
	SideBarBody,
	SideBarFooter,
	SideBarHeader,
	SideBarLinks,
	SidebarProvider
} from '../shared/components/sidebar/SidebarContext';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();
	const isAdmin = verify?.isAdminRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<header className='dashboard-header fixed top-0 w-full'>
				<Header />
			</header>
			<LayoutProvider>
				<SidebarProvider>
					<SideBarHeader />

					<SideBarBody>
						<SideBarLinks routes={adminRoutes}></SideBarLinks>
					</SideBarBody>

					<SideBarFooter />
				</SidebarProvider>

				<LayoutBody>
					<section className='container-text lg:ml-4 mt-2'>
						<Breadcrumbs crumbLabelMap={adminCrumbLabelMap} />
						{isAdmin}
					</section>
				</LayoutBody>
			</LayoutProvider>
		</section>
	);
}
