import type { InferRouteContract } from 'api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../fetch';
import { queryKeys } from '../queryClient';

// Get types from backend API package
import type { loginRoute, registerRoute, meRoute } from 'api';

type RegisterContract = InferRouteContract<typeof registerRoute>;
type LoginContract = InferRouteContract<typeof loginRoute>;
type MeContract = InferRouteContract<typeof meRoute>;

export type MeResponse = MeContract['response'];
export type RegisterBody = RegisterContract['body'];
export type LoginBody = LoginContract['body'];

export const me = {
	queryKey: queryKeys.auth.me,
	queryFn: async (): Promise<MeResponse> => apiFetch<MeResponse>('get', '/api/v1/auth/me'),
};

export function useMe() {
	return useQuery({
		...me,
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useRegister(options?: { onSuccess?(): void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: RegisterBody) => {
			return apiFetch<RegisterContract['response']>('post', '/api/v1/auth/register', { body });
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
			options?.onSuccess?.();
		},
	});
}

export function useLogin(options?: { onSuccess?(): void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: LoginBody) => {
			return apiFetch<LoginContract['response']>('post', '/api/v1/auth/login', { body });
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
			options?.onSuccess?.();
		},
	});
}

export function useLogout(options?: { onSuccess?(): void }) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return apiFetch('post', '/api/v1/auth/logout');
		},
		onSuccess: () => {
			queryClient.setQueryData(queryKeys.auth.me, null);
			void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
			options?.onSuccess?.();
		},
	});
}
