import db from '@cryptosense/db';
import Boom from '@hapi/boom';
import { z } from 'zod';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';

const SymbolsResponseSchema = z.object({ symbols: z.array(z.string()) });

async function getUserSymbols(userId: number): Promise<string[]> {
	const rows = await db<{ symbol: string }[]>`
		SELECT symbol FROM user_symbols
		WHERE user_id = ${userId}
		ORDER BY created_at ASC
	`;
	return rows.map((r) => r.symbol);
}

export const getUserSymbolsSchema = {
	response: SymbolsResponseSchema,
};

export const getUserSymbolsRoute = defineRoute({
	method: 'get',
	path: '/api/v1/user/symbols',
	schema: getUserSymbolsSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const symbols = await getUserSymbols(req.identity.accountId);
		return { symbols };
	},
});

export const addUserSymbolSchema = {
	body: z.object({ symbol: z.string().min(1).toUpperCase() }),
	response: SymbolsResponseSchema,
};

export const addUserSymbolRoute = defineRoute({
	method: 'post',
	path: '/api/v1/user/symbols',
	schema: addUserSymbolSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const { symbol } = req.body;

		// Validate the symbol exists on Binance
		const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
			signal: AbortSignal.timeout(5_000),
		});
		if (!binanceRes.ok) {
			throw Boom.badRequest(`${symbol} is not a valid Binance trading pair.`);
		}

		try {
			await db`
				INSERT INTO user_symbols (user_id, symbol)
				VALUES (${req.identity.accountId}, ${symbol})
			`;
		} catch {
			throw Boom.conflict(`${symbol} is already in your tracked pairs.`);
		}

		const symbols = await getUserSymbols(req.identity.accountId);
		return { symbols };
	},
});

export const removeUserSymbolSchema = {
	params: z.object({ symbol: z.string().min(1) }),
	response: SymbolsResponseSchema,
};

export const removeUserSymbolRoute = defineRoute({
	method: 'delete',
	path: '/api/v1/user/symbols/:symbol',
	schema: removeUserSymbolSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		await db`
			DELETE FROM user_symbols
			WHERE user_id = ${req.identity.accountId} AND symbol = ${req.params.symbol}
		`;

		const symbols = await getUserSymbols(req.identity.accountId);
		return { symbols };
	},
});
