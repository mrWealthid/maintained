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
import React, { Fragment } from 'react';
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
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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

	function handleBusinessSwitch(id: string) {
		console.log(id);
	}

	return (
		<Sidebar className='flex flex-col h-screen' collapsible='icon'>
			<SidebarHeader>
				<div className='flex flex-col py-2   justify-between'>
					{open && (
						<>
							{/* <section className='flex justify-between items-center'>
								<>
									<h3>Maintainly</h3>
									<span className='font-light text-xs italic'>
										Maintenance at it&apos;s best
									</span>
								</>
								<SidebarTrigger />
							</section> */}

							<section className='flex flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden'>
								{/* <h3>{data?.currentBusiness.businessName}</h3> */}

								<div className='relative'>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuButton
												size='lg'
												className='data-[state=open]:bg-sidebar-accent flex justify-between data-[state=open]:text-sidebar-accent-foreground'>
												{data?.memberships.find(
													(m) =>
														m.business.id ===
														data.currentBusiness.id
												)?.business.businessName ??
													'Select Business'}
												<ChevronDown />
											</SidebarMenuButton>
										</DropdownMenuTrigger>

										<DropdownMenuContent
											align='end'
											className='w-(--radix-dropdown-menu-trigger-width)   min-w-56 rounded-lg'>
											{data?.memberships.map((org) => (
												<DropdownMenuItem
													key={org.id}
													className='w-full text-left'
													onSelect={() =>
														handleBusinessSwitch(
															org.business.id
														)
													} // <- your switch function
												>
													{org.business.businessName}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								{/* <span className='font-light text-xs italic'>
								Maintenance at it&apos;s best
							</span> */}
							</section>
						</>
					)}
				</div>
			</SidebarHeader>
			<Separator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{routes.map((link) => {
								const isActive = pathname === link.path;

								return (
									<SidebarMenuItem key={link.name}>
										<SidebarMenuButton
											onClick={() => {
												if (isMobile)
													setOpenMobile(false);
											}}
											asChild>
											<Link
												href={link.path}
												className={`hover:translate-x-1  rounded-lg text-sm transition-all duration-500 flex items-center gap-2 ${
													isActive
														? 'bg-sidebar-accent text-button-primary'
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
