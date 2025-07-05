'use client';

import { useEffect, useState } from 'react';

export function useDarkMode() {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem('theme');
		if (stored === 'dark') {
			document.documentElement.classList.add('dark');
			setEnabled(true);
		} else {
			document.documentElement.classList.remove('dark');
			setEnabled(false);
		}
	}, []);

	const toggleDarkMode = (enabled: boolean) => {
		if (enabled) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
		setEnabled(enabled);
	};

	return { enabled, toggleDarkMode };
}
