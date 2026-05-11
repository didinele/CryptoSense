import type { InferRouteContract } from 'api';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { apiFetch } from '../fetch';

import type { sentimentSymbolRoute } from 'api';

type SentimentSymbolContract = InferRouteContract<typeof sentimentSymbolRoute>;
export type SentimentData = SentimentSymbolContract['response'];

export function useSentimentSymbol(symbol: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['api', 'market', 'sentiment', symbol],
		queryFn: async () => {
			return apiFetch<SentimentData>('get', '/api/v1/market/sentiment', {
				query: { symbol },
			});
		},
		...(options?.enabled !== undefined && { enabled: options.enabled }),
		staleTime: 1000 * 60 * 2, // 2 minute
	});
}
