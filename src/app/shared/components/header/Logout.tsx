'use client';
import { useLogout } from '@/app/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React from 'react';
import { PiSpinnerGapLight } from 'react-icons/pi';
import { GoSignOut } from 'react-icons/go';

const Logout = () => {
	const router = useRouter();
	const { isLoading, logOut } = useLogout(router);
	return (
		<button
			className='flex w-full items-center gap-1 cursor-pointer'
			onClick={() => logOut()}>
			<GoSignOut />
			<span>Logout</span>
			<span>{isLoading && <PiSpinnerGapLight />}</span>
		</button>
	);
};

export default Logout;
