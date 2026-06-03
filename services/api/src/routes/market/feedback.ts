import db from '@cryptosense/db';
import { z } from 'zod';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';

export const feedbackSchema = {
	body: z.object({
		symbol: z.string(),
		recommendation: z.enum(['BUY', 'SELL', 'HOLD']),
		feedback: z.enum(['positive', 'negative']),
	}),
};

export const feedbackRoute = defineRoute({
	method: 'post',
	path: '/api/v1/market/feedback',
	schema: feedbackSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol, recommendation, feedback } = req.body;
		const { accountId } = req.identity;

		await db`
			INSERT INTO ai_feedback (user_id, symbol, recommendation, feedback)
			VALUES (${accountId}, ${symbol}, ${recommendation}, ${feedback})
		`;
	},
});
