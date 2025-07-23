'use client';

import { useEffect, useState } from 'react';
import { MdLightMode, MdNightlightRound } from 'react-icons/md';
import { Switch } from '@/components/ui/switch'; // your shadcn switch
import { setThemeCookie } from '@/utils/theme'; // adjust import path

export default function ThemeToggle() {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const theme = localStorage.getItem('theme') || 'light';
		setEnabled(theme === 'dark');
	}, []);

	const toggleDarkMode = (value: boolean) => {
		setEnabled(value);
		const theme = value ? 'dark' : 'light';

		// Set to localStorage for immediate hydration
		localStorage.setItem('theme', theme);

		// Set server cookie for SSR
		setThemeCookie(theme);

		// Apply to <html>
		document.documentElement.classList.toggle('dark', theme === 'dark');
	};

	return (
		<div className='flex items-center gap-1 p-0'>
			<MdLightMode />
			<Switch
				className='data-[state=checked]:bg-foreground relative inline-flex items-center rounded-full'
				checked={enabled}
				onCheckedChange={toggleDarkMode}
			/>
			<MdNightlightRound />

			<button
				onClick={() => toggleDarkMode(true)}
				className='ml-4 text-xs'>
				Dark Mode
			</button>
		</div>
	);
}
