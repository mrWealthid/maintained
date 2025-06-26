import MiddlewareFeatures from '@/middlewareFeatures';
import SideBar from '../shared/components/sidebar/SideBarComponent';
import { redirect } from 'next/navigation';
import { routes } from '../shared/routes/routes';
import Header from '../shared/components/header/Header';
import Breadcrumbs from '../shared/components/breadcrumbs/BreadCrumbs';
import { crumbLabelMap } from '../shared/data/data';
import {
	SideBarBody,
	SideBarFooter,
	SideBarHeader,
	SideBarLinks,
	SidebarProvider
} from '../shared/components/sidebar/SidebarContext';
import {
	LayoutBody,
	LayoutProvider
} from '../shared/contexts/LayoutContextProvider';

export default function DashboardLayout({
	children // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	const verify = new MiddlewareFeatures().verifyToken();

	const isUser = verify?.isUserRole ? children : redirect('/auth/login');

	return (
		<section className='min-h-screen'>
			<header className='dashboard-header fixed top-0 w-full'>
				<Header />
			</header>
			<LayoutProvider>
				<SidebarProvider>
					<SideBarHeader />
					<SideBarBody>
						<SideBarLinks routes={routes}></SideBarLinks>
					</SideBarBody>

					<SideBarFooter />
				</SidebarProvider>
				<LayoutBody>
					<section className='container-text lg:ml-4 mt-2'>
						<Breadcrumbs crumbLabelMap={crumbLabelMap} />
						{isUser}
					</section>
				</LayoutBody>
			</LayoutProvider>
		</section>
	);
}
