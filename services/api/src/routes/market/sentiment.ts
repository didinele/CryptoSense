import db from '@cryptosense/db';
import Boom from '@hapi/boom';
import { z } from 'zod';
import { runSentimentAgent, SentimentOutputSchema } from '../../ai/sentiment.js';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';

export const sentimentSymbolSchema = {
	query: z.object({
		symbol: z.string().min(1),
	}),
	response: SentimentOutputSchema,
};

async function fetchNewsForSymbol(symbol: string): Promise<string[]> {
	const rows = await db<{ headline: string }[]>`
		SELECT headline
		FROM news_data
		WHERE symbol = ${symbol}
		ORDER BY published_at DESC NULLS LAST
		LIMIT 10
	`;

	if (rows.length === 0) {
		throw Boom.notFound('No news data available yet for this symbol. Please wait for the news sync to complete.');
	}

	return rows.map((r) => r.headline);
}

export const sentimentSymbolRoute = defineRoute({
	method: 'get',
	path: '/api/v1/market/sentiment',
	schema: sentimentSymbolSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol } = req.query;

		const newsHeadlines = await fetchNewsForSymbol(symbol);

		return runSentimentAgent(symbol, newsHeadlines);
	},
});
