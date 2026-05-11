import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { InferRouteContract, sentimentSymbolRoute  } from 'api';
import { apiFetch } from '../fetch';

type SentimentSymbolContract = InferRouteContract<typeof sentimentSymbolRoute>;
export type SentimentData = SentimentSymbolContract['response'];

export function useSentimentSymbol(symbol: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['api', 'market', 'sentiment', symbol],
		queryFn: async () => apiFetch<SentimentData>('get', '/api/v1/market/sentiment', {
				query: { symbol },
			}),
		...(options?.enabled !== undefined && { enabled: options.enabled }),
		staleTime: 1_000 * 60 * 2, // 2 minute
	});
}
