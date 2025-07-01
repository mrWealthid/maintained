'use client';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
// import { Switch } from '@headlessui/react';

import { MdNightlightRound, MdLightMode } from 'react-icons/md';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function SwitchToggle() {
	const { enabled, toggleDarkMode } = useDarkMode();
	// const [enabled, setEnabled] = useState(false);
	// let isDarkMode = false;

	// useEffect(() => {
	// 	updateTheme();
	// }, []);

	// function toggleTheme(theme: string): void {
	// 	localStorage['theme'] = theme;
	// 	updateTheme();
	// }

	// function updateTheme() {
	// 	if (
	// 		localStorage['theme'] === 'dark' ||
	// 		(!('theme' in localStorage) &&
	// 			window.matchMedia('(prefers-color-scheme: dark)').matches)
	// 	) {
	// 		document.documentElement.classList.add('dark');

	// 		// document.body.style.setProperty('--background-color', '#192734');
	// 		isDarkMode = true;
	// 		setEnabled(true);
	// 	} else {
	// 		document.documentElement.classList.remove('dark');
	// 		// document.body.style.setProperty('--background-color', '#eceef1');

	// 		isDarkMode = false;
	// 		setEnabled(false);
	// 	}
	// }

	// function handleChange(val: any) {
	// 	setEnabled(val);
	// 	toggleTheme(val ? 'dark' : 'light');
	// }

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
