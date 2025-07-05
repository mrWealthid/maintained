import React from 'react';

const TicketCardLoader = () => (
	<section className='request-card w-full animate-pulse'>
		<div className='flex items-center flex-wrap justify-between w-full text-xs mb-2'>
			<section className='flex gap-5 items-center'>
				<div className='h-4 w-20 bg-muted rounded' />
				<div className='h-4 w-16 bg-muted rounded' />
			</section>
			<section>
				<div className='flex items-center gap-2'>
					<div className='h-3 w-3 rounded-full bg-muted' />
					<div className='h-4 w-16 bg-muted rounded' />
				</div>
			</section>
		</div>

		<div className='group'>
			<div className='mt-3 h-6 w-2/3 bg-muted rounded mb-2' />
			<div className='mt-2 h-4 w-full bg-muted/65 rounded' />
			<div className='mt-1 h-4 w-5/6 bg-muted/65 rounded' />
			<div className='mt-1 h-4 w-4/6 bg-muted/65 rounded' />
		</div>

		<div className='w-full mt-8 flex flex-wrap text-xs justify-between items-center gap-x-4'>
			<span className='flex items-center gap-2'>
				<div className='h-4 w-4 bg-muted rounded-full' />
				<div className='h-4 w-20 bg-muted rounded' />
			</span>
			<span className='flex items-center gap-2'>
				<div className='h-4 w-4 bg-muted rounded-full' />
				<div className='h-4 w-20 bg-muted rounded' />
			</span>
			<section className='flex gap-2 items-center text-xs'>
				<div className='h-8 w-8 bg-muted rounded-full' />
			</section>
		</div>
	</section>
);

export default TicketCardLoader;
