import React from 'react';
import TicketCardLoader from '@/shared/ticket-feat/loaders/TicketCardLoader';

const loading = () => {
	<section className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2'>
		{Array.from({ length: 9 }).map((_, i) => (
			<TicketCardLoader key={i} />
		))}
	</section>;
};

export default loading;
