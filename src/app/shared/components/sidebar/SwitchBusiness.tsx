import React, { useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { useProfile, useSwitchBusiness } from '../profile/hooks/useProfile';
import { User } from '../../model/model';
import { ChevronDown, LoaderCircle } from 'lucide-react';

export const SwitchBusiness = () => {
	const [open, setOpen] = useState(false);
	const { data, isLoading, error } = useProfile<User>();

	const { isSwitching, handleSwitchCurrentBusiness } = useSwitchBusiness();

	function handleBusinessSwitch(id: string) {
		handleSwitchCurrentBusiness(
			{ currentBusiness: id },
			{
				onSuccess: () => {
					setOpen(false);
				}
			}
		);
	}

	const [activeBusinessId, setActiveBusinessId] = useState<string | null>(
		null
	);
	return (
		<section className='flex flex-1 flex-col gap-1 group-data-[collapsible=icon]:hidden'>
			{/* <h3>{data?.currentBusiness.businessName}</h3> */}

			<div className='relative'>
				<DropdownMenu open={open} onOpenChange={setOpen}>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='focus-visible:ring-0 data-[state=open]:bg-sidebar-accent flex justify-between  data-[state=open]:text-sidebar-accent-foreground'>
							{data?.memberships.find(
								(m) => m.business.id === data.currentBusiness.id
							)?.business.name ?? 'Select Business'}
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
								onSelect={(e) => {
									e.preventDefault();
									handleBusinessSwitch(org.business.id);
									setActiveBusinessId(org.business.id);
								}}>
								{org.business.name}
								{isSwitching &&
									activeBusinessId === org.business.id && (
										<LoaderCircle
											strokeWidth={1}
											size={18}
											className='ml-2 text-button-primary animate-spin'
										/>
									)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</section>
	);
};
