import { useMutation } from '@tanstack/react-query';
import type { InferRouteContract, strategyRoute  } from 'api';
import { apiFetch } from '../fetch';

type StrategyContract = InferRouteContract<typeof strategyRoute>;
export type StrategyData = StrategyContract['response'];

export function useStrategist() {
	return useMutation<StrategyData, Error, StrategyContract['body']>({
		mutationFn: async (payload) => apiFetch<StrategyData>('post', '/api/v1/market/strategy', {
				body: payload,
			}),
	});
}
