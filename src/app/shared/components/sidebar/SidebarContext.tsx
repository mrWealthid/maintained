'use client';
import React, {
	createContext,
	useContext,
	useState,
	useRef,
	ReactNode,
	Fragment
} from 'react';
import { Routes } from '../../model/model';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useClickOutside from '../../hooks/ClickOutside';
import { Menu, Transition } from '@headlessui/react';
import Logout from '../header/Logout';
import Profile from '../profile/Profile';
import { TfiAngleRight } from 'react-icons/tfi';
import { LuPanelLeftClose, LuPanelRightClose } from 'react-icons/lu';
import { useLayoutContext } from '../../contexts/LayoutContextProvider';

interface SidebarContextType {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	toggleCollapsible: () => void;
	sidebarRef: React.RefObject<HTMLElement>;
	// collapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const sidebarRef = useRef<HTMLElement>(null);

	const toggleSidebar = () => setIsOpen((prev) => !prev);
	const closeSidebar = () => setIsOpen(false);
	const { width, updateIsCollapsed, isCollapsed } = useLayoutContext();
	const toggleCollapsible = () => {
		updateIsCollapsed(!isCollapsed);
	};

	useClickOutside(sidebarRef, closeSidebar);
	return (
		<SidebarContext.Provider
			value={{
				isOpen,
				setIsOpen,
				toggleSidebar,
				sidebarRef,
				// collapsed,
				toggleCollapsible
			}}>
			<section ref={sidebarRef} className='flex'>
				{!isOpen && (
					<button
						type='button'
						onClick={() => setIsOpen(!isOpen)}
						className='shadow  z-50 fixed top-2 bg-white dark:glass items-center p-2 w-8 h-8 flex mt-1   ml-3 text-sm text-gray-500 justify-center  rounded-full sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'>
						<span className='sr-only'>Open sidebar</span>
						<svg
							className='w-4 h-6'
							aria-hidden='true'
							fill='currentColor'
							viewBox='0 0 20 20'
							xmlns='http://www.w3.org/2000/svg'>
							<path
								clipRule='evenodd'
								fillRule='evenodd'
								d='M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z'></path>
						</svg>
					</button>
				)}

				<aside
					style={{
						width: `${width}px`,
						transition: 'width 0.3s ease, transform 0.3s ease'
					}}
					className={`fixed top-0 left-0 z-30  h-screen transition-transform ${
						!isOpen ? '-translate-x-full' : ''
					} sm:translate-x-0`}>
					<div className='flex flex-col  min-h-screen  bg-primary dark:glass text-white py-4'>
						{children}
						{/* <p className='flex first-letter:text-blue-700 first-letter:text-xl border-gray-50 p-2 rounded-lg justify-center space-x-4 text-white'>
						{data?.business.businessName}
					</p>
					<small className='italic text-center text-xs'>
						...Maintenance at its best...
					</small> */}
						{/* <section className='flex flex-col  gap-3  mt-10 px-4'>
						{routes.map((link) => {
							const isActive = pathname === link.path;

							return (
								<Link
									onClick={handleClose}
									href={link.path}
									key={link.name}
									className={`hover:translate-x-1  rounded-lg text-sm transition-all duration-500 flex items-center gap-2 ${
										isActive
											? 'px-3   py-2 border-none  glass  text-white'
											: ''
									}`}>
									{link.icon &&
										React.createElement(link.icon)}

									{link.name}
								</Link>
							);
						})}
					</section> */}
					</div>
				</aside>

				{/* {children} */}
			</section>
		</SidebarContext.Provider>
	);
};

export const useSidebarContext = () => {
	const context = useContext(SidebarContext);
	if (!context)
		throw new Error(
			'useSidebarContext must be used within SidebarProvider'
		);
	return context;
};

export const SideBarHeader = ({ children }: { children?: React.ReactNode }) => {
	const { toggleCollapsible, isOpen } = useSidebarContext();
	const { data: user, isCollapsed } = useLayoutContext();

	return (
		<header
			className={`px-4 flex items-center border-b border-white/10 pb-2 ${
				isCollapsed ? 'justify-center' : 'justify-between'
			}`}>
			{/* Show custom children if provided */}
			{children
				? children
				: !isCollapsed && (
						<div className='flex flex-col'>
							<p className='flex justify-center text-white p-2 rounded-lg border-gray-50 first-letter:text-blue-700 first-letter:text-xl'>
								{user?.business?.businessName}
							</p>
							<small className='italic text-center text-xs'>
								...Maintenance at its best...
							</small>
						</div>
					)}

			{/* Toggle button only if sidebar is closed (mobile?) */}

			<button
				onClick={toggleCollapsible}
				aria-label='Toggle sidebar'
				title='Toggle sidebar'
				className='hidden md:flex'>
				{isCollapsed ? (
					<LuPanelRightClose size={22} />
				) : (
					<LuPanelLeftClose size={22} />
				)}
			</button>
		</header>
	);
};

export const SideBarBody = ({ children }: { children: React.ReactNode }) => {
	const { isCollapsed } = useLayoutContext();

	return (
		<section
			className={`flex flex-col flex-1 ${isCollapsed ? 'items-center' : ''} gap-3  px-4`}>
			{children}
		</section>
	);
};
export const SideBarLinks = ({ routes }: { routes: Routes[] }) => {
	const pathname = usePathname();
	const { toggleSidebar } = useSidebarContext();
	const { isCollapsed } = useLayoutContext();
	return (
		<nav className='flex flex-col  gap-3  mt-10'>
			{routes.map((link) => {
				const isActive = pathname === link.path;

				return (
					<Link
						onClick={toggleSidebar}
						href={link.path}
						key={link.name}
						className={`hover:translate-x-1 rounded-lg text-sm transition-all duration-500 flex items-center gap-2 ${
							isActive
								? 'px-2 py-2 border-none glass  text-white'
								: ''
						}`}>
						{link.icon &&
							React.createElement(link.icon, {
								className: 'text-xl w-5 h-5'
							})}
						{!isCollapsed && link.name}
					</Link>
				);
			})}
		</nav>
	);
};

export const SideBarFooter = ({ children }: { children?: React.ReactNode }) => {
	const { isCollapsed } = useLayoutContext();
	return (
		<footer
			className={`${isCollapsed ? 'px-3' : 'px-1'} pt-2 border-t border-white/10 text-xs text-center text-gray-300`}>
			{!children ? (
				<Menu
					as='div'
					className='relative inline-block w-full text-left'>
					{({ open }) => (
						<>
							<Menu.Button
								className={`inline-flex justify-between items-center w-full rounded hover:glass  p-2 text-sm font-medium text-white

                  ${open ? 'glass ' : ''}
                `}>
								<Profile collapsed={isCollapsed} />

								<TfiAngleRight />
							</Menu.Button>

							<Transition
								as={Fragment}
								enter='transition ease-out duration-100'
								enterFrom='transform opacity-0 scale-95'
								enterTo='transform opacity-100 scale-100'
								leave='transition ease-in duration-75'
								leaveFrom='transform opacity-100 scale-100'
								leaveTo='transform opacity-0 scale-95'>
								<Menu.Items className='absolute text-white md:text-black dark:text-white z-50 origin-top bottom-full   md:origin-top-left md:left-full md:top-0 md:bottom-0 mb-3  md:mb-0  md:ml-6  w-3/4  divide-y divide-gray-100 rounded-md glass shadow-lg ring-1 ring-black/5 focus:outline-none'>
									<div className='py-3 px-2'>
										<Menu.Item>
											{({ active }) => <Logout />}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Transition>
						</>
					)}
				</Menu>
			) : (
				children
			)}
		</footer>
	);
};
