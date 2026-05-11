'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { useState, type PropsWithChildren } from 'react';

export function Providers({ children }: PropsWithChildren) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1_000,
						retry: false,
					},
				},
			}),
	);

	return (
		<JotaiProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</JotaiProvider>
	);
}
