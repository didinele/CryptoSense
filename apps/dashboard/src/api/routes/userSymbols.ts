import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InferRouteContract, addUserSymbolRoute, getUserSymbolsRoute, removeUserSymbolRoute } from 'api';
import { apiFetch } from '../fetch';

type GetSymbolsContract = InferRouteContract<typeof getUserSymbolsRoute>;
type AddSymbolContract = InferRouteContract<typeof addUserSymbolRoute>;
type RemoveSymbolContract = InferRouteContract<typeof removeUserSymbolRoute>;

export type UserSymbolsData = GetSymbolsContract['response'];

const QUERY_KEY = ['api', 'user', 'symbols'];

export function useGetUserSymbols() {
	return useQuery({
		queryKey: QUERY_KEY,
		queryFn: async () => apiFetch<UserSymbolsData>('get', '/api/v1/user/symbols'),
	});
}

export function useAddUserSymbol() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (symbol: string) =>
			apiFetch<AddSymbolContract['response']>('post', '/api/v1/user/symbols', {
				body: { symbol },
			}),
		onSuccess(data) {
			queryClient.setQueryData(QUERY_KEY, data);
		},
	});
}

export function useRemoveUserSymbol() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (symbol: string) =>
			apiFetch<RemoveSymbolContract['response']>('delete', `/api/v1/user/symbols/${symbol}`),
		onSuccess(data) {
			queryClient.setQueryData(QUERY_KEY, data);
		},
	});
}
