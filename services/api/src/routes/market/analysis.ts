import db from '@cryptosense/db';
import { z } from 'zod';
import { runAnalystAgent, AnalystOutputSchema } from '../../ai/analyst.js';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';

export const analyzeSymbolSchema = {
	query: z.object({
		symbol: z.string().min(1),
	}),
	response: AnalystOutputSchema,
};

export const analyzeSymbolRoute = defineRoute({
	method: 'get',
	path: '/api/v1/market/analysis',
	schema: analyzeSymbolSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol } = req.query;

		// Preluam ultimele 50 de inregistrari de pret din baza de date pentru simbolul ales
		const rows = await db`
			SELECT price FROM market_data 
			WHERE symbol = ${symbol} 
			ORDER BY timestamp DESC 
			LIMIT 50
		`;

		if (rows.length === 0) {
			throw new Error(`Nu există date disponibile momentan pentru ${symbol}. Așteaptă rularea cron-ului.`);
		}

		// Reversăm vectorul pentru a obține formatul cronologic (vechi -> cel mai nou)
		const prices = rows.map(r => Number(r['price'])).reverse();

		// Rulăm AI Agent-ul peste setul de date
		return runAnalystAgent(symbol, prices);
	},
});