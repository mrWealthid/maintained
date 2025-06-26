'use client';

import Image from 'next/image';

export default function Empty({
	message = 'No records found'
}: {
	message?: string;
}) {
	return (
		<div className='flex flex-col items-center justify-center text-center py-16'>
			{/* Illustration */}
			<Image
				src='/illustrations/no-record.svg' // ⬅️ place in /public/illustrations/
				alt='No data illustration'
				width={300}
				height={300}
				className='mb-6'
			/>

			{/* Message */}
			<h2 className='text-lg font-semibold text-gray-600 dark:text-gray-300'>
				{message}
			</h2>
			<p className='text-sm text-gray-500 mt-2'>
				Please check back later or adjust your filters.
			</p>
		</div>
	);
}
