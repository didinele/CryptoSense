import db from '@cryptosense/db';
import { notFound } from '@hapi/boom';
import { z } from 'zod';
import { requireAuth } from '../../auth/middleware.js';
import { defineRoute } from '../../core/route.js';

export const meSchema = {
	response: z.object({
		id: z.number(),
		username: z.string(),
	}),
};

export const meRoute = defineRoute({
	method: 'get',
	path: '/api/v1/auth/me',
	schema: meSchema,
	middleware: [requireAuth] as const,
	async handler(req) {
		const [user] = await db`SELECT id, username FROM users WHERE id = ${req.identity.accountId}`;

		if (!user) {
			throw notFound('User not found');
		}

		return {
			id: user['id'],
			username: user['username'],
		};
	},
});
