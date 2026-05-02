'use client';
import { useLogout } from '@/app/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Loader2, LogOut } from 'lucide-react';

const Logout = () => {
	const router = useRouter();
	const { isLoading, logOut } = useLogout(router);
	return (
		<button
			className='flex w-full items-center gap-1 cursor-pointer'
			onClick={() => logOut()}>
			<LogOut className='h-4 w-4' />
			<span>Logout</span>
			<span>{isLoading && <Loader2 className='h-4 w-4 animate-spin' />}</span>
		</button>
	);
};

export default Logout;
