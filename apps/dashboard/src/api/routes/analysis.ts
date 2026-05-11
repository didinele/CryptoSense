import { useQuery } from '@tanstack/react-query';
import type { InferRouteContract, analyzeSymbolRoute } from 'api';
import { apiFetch } from '../fetch';

type AnalyzeSymbolContract = InferRouteContract<typeof analyzeSymbolRoute>;
export type AnalysisData = AnalyzeSymbolContract['response'];

export function useAnalyzeSymbol(symbol: string, options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['api', 'market', 'analysis', symbol],
		queryFn: async () =>
			apiFetch<AnalysisData>('get', '/api/v1/market/analysis', {
				query: { symbol },
			}),
		...(options?.enabled !== undefined && { enabled: options.enabled }),
		staleTime: 1_000 * 60 * 2, // 2 minute
	});
}
