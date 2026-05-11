import db from '@cryptosense/db';
import { conflict } from '@hapi/boom';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { createAccessToken, createRefreshToken, setAccessHeader, setRefreshCookie } from '../../auth/tokens.js';
import { defineRoute } from '../../core/route.js';

export const registerSchema = {
	body: z.object({
		username: z.string().min(3).max(255),
		password: z.string().min(8).max(255),
	}),
	response: z.object({
		id: z.number(),
		username: z.string(),
	}),
};

export const registerRoute = defineRoute({
	method: 'post',
	path: '/api/v1/auth/register',
	schema: registerSchema,
	async handler(req, res) {
		const { username, password } = req.body;

		// Check if user exists
		const [existing] = await db`SELECT id FROM users WHERE username = ${username}`;
		if (existing) {
			throw conflict('Username is already taken');
		}

		// Hash password
		const passwordHash = await bcrypt.hash(password, 12);

		// Insert user
		const [user] = await db`
			INSERT INTO users (username, password_hash)
			VALUES (${username}, ${passwordHash})
			RETURNING id, username
		`;

		const accountId = user!['id'];

		// Issue tokens
		setAccessHeader(res, createAccessToken(accountId));
		setRefreshCookie(res, createRefreshToken(accountId));

		return {
			id: accountId,
			username: user!['username'],
		};
	},
});
