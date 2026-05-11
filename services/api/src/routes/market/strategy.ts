import { z } from 'zod';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';
import { runStrategistAgent, StrategistOutputSchema } from '../../ai/strategist.js';
import { AnalystOutputSchema } from '../../ai/analyst.js';
import { SentimentOutputSchema } from '../../ai/sentiment.js';

export const strategySchema = {
	body: z.object({
		symbol: z.string(),
		analystData: AnalystOutputSchema,
		sentimentData: SentimentOutputSchema,
	}),
	response: StrategistOutputSchema,
};

export const strategyRoute = defineRoute({
	method: 'post',
	path: '/api/v1/market/strategy',
	schema: strategySchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol, analystData, sentimentData } = req.body;

		// Combina AI-urile trecute intr'un al 3-lea strateg decizional !
		const strategistAnalysis = await runStrategistAgent(symbol, analystData, sentimentData);

		return strategistAnalysis;
	},
});
