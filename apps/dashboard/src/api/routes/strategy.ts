import type { InferRouteContract } from 'api';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../fetch';

import type { strategyRoute } from 'api';

type StrategyContract = InferRouteContract<typeof strategyRoute>;
export type StrategyData = StrategyContract['response'];

export function useStrategist() {
	return useMutation<StrategyData, Error, StrategyContract['body']>({
		mutationFn: async (payload) => {
			return apiFetch<StrategyData>('post', '/api/v1/market/strategy', {
				body: payload,
			});
		},
	});
}
