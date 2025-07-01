'use client';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
// import { Switch } from '@headlessui/react';

import { MdNightlightRound, MdLightMode } from 'react-icons/md';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function SwitchToggle() {
	const { enabled, toggleDarkMode } = useDarkMode();

	return (
		<div className='flex items-center gap-1 p-0'>
			<MdLightMode />

			<Switch
				className={`
        data-[state=checked]:bg-foreground
        relative inline-flex  items-center rounded-full
      `}
				checked={enabled}
				onCheckedChange={toggleDarkMode}
			/>

			<MdNightlightRound />
		</div>
	);
}
