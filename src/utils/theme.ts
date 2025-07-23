'use server';
import { cookies } from 'next/headers';

export async function setThemeCookie(value: 'dark' | 'light') {
	const themeCookie = await cookies();
	themeCookie.set('theme', value, {
		path: '/',
		maxAge: 60 * 60 * 24 * 30 * 12
	});
}

export async function getThemeFromCookie(): Promise<'dark' | 'light'> {
	const themeCookie = await cookies();
	const theme = themeCookie.get('theme')?.value;
	return theme === 'dark' ? 'dark' : 'light';
}
