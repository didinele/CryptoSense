import type { ServerResponse as Response } from 'node:http';
import db from '@cryptosense/db';
import { unauthorized } from '@hapi/boom';
import cookie from 'cookie';
import type { Request } from 'polka';
import { defineMiddleware } from '../core/route.js';
import {
	createAccessToken,
	createRefreshToken,
	REFRESH_COOKIE,
	setAccessHeader,
	setRefreshCookie,
	verifyToken,
} from './tokens.js';

export interface RequestIdentity {
	accountId: number;
}

/**
 * Attempts to resolve the request identity from the Authorization header or refresh cookie.
 * Silently rotates tokens on success. Returns null if no valid user identity is found.
 */
async function tryResolveUser(req: Request, res: Response): Promise<RequestIdentity | null> {
	// 1. Try the access token from the Authorization header
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith('Bearer ')) {
		const rawToken = authHeader.slice(7);

		try {
			const payload = verifyToken(rawToken);

			if (!payload.refresh) {
				const accountId = Number(payload.sub);
				setAccessHeader(res, createAccessToken(accountId));
				setRefreshCookie(res, createRefreshToken(accountId));
				return { accountId };
			}
		} catch {
			// Token invalid, expired, or was a refresh token where an access token was expected
			// Fall through to the refresh cookie check
		}
	}

	// 2. Try the refresh token from the cookie
	const cookies = cookie.parse(req.headers.cookie ?? '');
	const refreshToken = cookies[REFRESH_COOKIE];

	if (refreshToken) {
		try {
			const payload = verifyToken(refreshToken);

			if (payload.refresh) {
				const accountId = Number(payload.sub);

				// Safety check: is the refresh token older than the last password change?
				const [user] = await db`SELECT password_changed_at FROM users WHERE id = ${accountId}`;

				if (user) {
					const issuedAt = payload.iat * 1_000;
					const passwordChangedAt = user['password_changed_at'] ? new Date(user['password_changed_at']).getTime() : 0;

					if (issuedAt >= passwordChangedAt) {
						setAccessHeader(res, createAccessToken(accountId));
						setRefreshCookie(res, createRefreshToken(accountId));
						return { accountId };
					}
				}
			}
		} catch {
			// Malformed or expired refresh token
		}
	}

	return null;
}

export const requireAuth = defineMiddleware<{ identity: RequestIdentity }>(async (req, res, next) => {
	const identity = await tryResolveUser(req, res);

	if (!identity) {
		next(unauthorized('You must be logged in.'));
		return;
	}

	Reflect.set(req, 'identity', identity);
	next();
});
