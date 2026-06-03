import { useMutation } from '@tanstack/react-query';
import type { InferRouteContract, feedbackRoute } from 'api';
import { apiFetch } from '../fetch';

type FeedbackContract = InferRouteContract<typeof feedbackRoute>;

export function useSubmitFeedback() {
	return useMutation<undefined, Error, FeedbackContract['body']>({
		mutationFn: async (payload) => {
			await apiFetch('post', '/api/v1/market/feedback', { body: payload });
			return undefined;
		},
	});
}
