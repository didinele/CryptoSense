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

// Mock function to simulate fetching recent news.
// In a real scenario, this would call a News API like CryptoPanic or NewsAPI.
async function fetchNewsForSymbol(symbol: string): Promise<string[]> {
	// Fallback/mock news data based on the symbol
	return [
		`${symbol} sees massive surge in institutional adoption according to new reports.`,
		`Regulatory concerns shadow ${symbol}'s recent price movements.`,
		`New technological upgrades on the ${symbol} network expected next month.`,
		`Market analysts predict a huge bull run for ${symbol} as volume spikes.`,
		`Security breach in a major exchange negatively impacts ${symbol} sentiment.`,
	];
}

export const sentimentSymbolRoute = defineRoute({
	method: 'get',
	path: '/api/v1/market/sentiment',
	schema: sentimentSymbolSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol } = req.query;

		// Fetch the latest news headlines for the given symbol
		const newsHeadlines = await fetchNewsForSymbol(symbol);

		// Rulăm AI Agent-ul peste titlurile de știri
		return runSentimentAgent(symbol, newsHeadlines);
	},
});
