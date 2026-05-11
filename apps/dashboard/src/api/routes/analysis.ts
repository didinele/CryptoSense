import type { InferRouteContract } from 'api';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../fetch';

import type { analyzeSymbolRoute } from 'api';

type AnalyzeSymbolContract = InferRouteContract<typeof analyzeSymbolRoute>;

export function useAnalyzeSymbol(symbol: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['api', 'market', 'analysis', symbol],
		queryFn: async () => {
			return apiFetch<AnalyzeSymbolContract['response']>('get', '/api/v1/market/analysis', {
				query: { symbol },
			});
		},
		enabled: options?.enabled,
		staleTime: 1000 * 60 * 2, // 2 minute
	});
}