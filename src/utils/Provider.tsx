'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function Provider({ children }: React.PropsWithChildren) {
	const [client] = React.useState(() => new QueryClient());

	return (
		<QueryClientProvider client={client}>
			{children}
			{process.env.NODE_ENV !== 'production' ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	);
}

export default Provider;
