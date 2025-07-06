'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link'; // ✅ Correct import
import React from 'react';
import { Routes, User } from '@/app/shared/model/model';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Profile from '@/app/shared/components/profile/Profile';
import Logout from '@/app/shared/components/header/Logout';
import { useProfile } from '@/app/shared/components/profile/hooks/useProfile';

export function AppSidebar({ routes }: { routes: Routes[] }) {
	const pathname = usePathname();
	const {
		state,
		open,
		setOpen,
		openMobile,
		setOpenMobile,
		isMobile,
		toggleSidebar
	} = useSidebar();

	const { data, isLoading, error } = useProfile<User>();

	return (
		<Sidebar className='flex flex-col h-screen' collapsible='icon'>
			<SidebarHeader>
				<div className='flex px-2 justify-between'>
					{open && (
						<section className='flex  flex-col gap-1 group-data-[collapsible=icon]:hidden'>
							<h3>{data?.business.businessName}</h3>
							<span className='font-light text-xs italic'>
								Maintenance at it&apos;s best
							</span>
						</section>
					)}
					<SidebarTrigger />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{routes.map((link) => {
								const isActive = pathname === link.path;

								return (
									<SidebarMenuItem key={link.name}>
										<SidebarMenuButton asChild>
											<Link
												href={link.path}
												onClick={() => {
													if (isMobile)
														setOpen(false);
												}}
												className={`hover:translate-x-1  rounded-lg text-sm transition-all duration-500 flex items-center gap-2 ${
													isActive
														? 'bg-sidebar-accent'
														: ''
												}`}>
												{link.icon &&
													React.createElement(
														link.icon,
														{
															className:
																'text-xl w-5 h-5'
														}
													)}
												{link.name}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
									<Profile />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className='w-(--radix-dropdown-menu-trigger-width)  min-w-56 rounded-lg'
								side={isMobile ? 'bottom' : 'right'}
								align='end'
								sideOffset={4}>
								{/* <DropdownMenuLabel className='p-0 font-normal'></DropdownMenuLabel> */}

								{/* <DropdownMenuGroup> */}
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault(); // ✅ keeps the dropdown open
									}}>
									<Logout />
								</DropdownMenuItem>

								{/* </DropdownMenuGroup> */}
								<DropdownMenuSeparator />
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
