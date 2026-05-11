import db from '@cryptosense/db';
import { unauthorized } from '@hapi/boom';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createAccessToken, createRefreshToken, setAccessHeader, setRefreshCookie } from '../../auth/tokens.js';
import { defineRoute } from '../../core/route.js';

export const loginSchema = {
	body: z.object({
		username: z.string(),
		password: z.string(),
	}),
	response: z.object({
		id: z.number(),
		username: z.string(),
	}),
};

export const loginRoute = defineRoute({
	method: 'post',
	path: '/api/v1/auth/login',
	schema: loginSchema,
	async handler(req, res) {
		const { username, password } = req.body;

		const [user] = await db`SELECT id, username, password_hash FROM users WHERE username = ${username}`;

		// Dummy hash for anti-enumeration timing
		const dummyHash = '$2b$12$A8l4.bV6qO.5.1A3z4c1bO3Wq5O.5.1A3z4c1bO3Wq5O.5.1A3z4';
		const hashToCompare = user ? user['password_hash'] : dummyHash;

		const isValid = await bcrypt.compare(password, hashToCompare);

		if (!user || !isValid) {
			throw unauthorized('Invalid username or password');
		}

		const accountId = user['id'];

		setAccessHeader(res, createAccessToken(accountId));
		setRefreshCookie(res, createRefreshToken(accountId));

		return {
			id: accountId,
			username: user['username'],
		};
	},
});
