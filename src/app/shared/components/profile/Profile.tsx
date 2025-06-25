'use client';
import React from 'react';
import { useProfile } from './hooks/useProfile';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User } from '../../model/model';

function Profile({ collapsible }: { collapsible: boolean }) {
	const { data, isLoading, error } = useProfile<User>();
	const router = useRouter();

	return (
		<div className='flex  items-center gap-2'>
			<Image
				// onClick={() => router.push('/dashboard/account')}
				width={30}
				height={30}
				className='border cursor-pointer rounded-full'
				alt='default'
				src={'/images/default.jpg'}
			/>

			{!collapsible && <span className='capitalize'>{data?.name}</span>}
		</div>
	);
}

export default Profile;
