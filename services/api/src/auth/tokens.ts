/* eslint-disable @typescript-eslint/dot-notation */

import type { ServerResponse as Response } from 'node:http';
import process from 'node:process';
import { unauthorized } from '@hapi/boom';
import jwt from 'jsonwebtoken';
import { clearCookie, setCookie } from '../http/response.js';

export interface AccessTokenPayload {
	iat: number;
	refresh: false;
	sub: string;
}

export interface RefreshTokenPayload {
	iat: number;
	refresh: true;
	sub: string;
}

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

export function createAccessToken(accountId: number): string {
	const secret = process.env['JWT_SECRET'] ?? 'default_dev_secret_that_is_long_enough_32';
	return jwt.sign({ sub: String(accountId), refresh: false }, secret, {
		expiresIn: 5 * 60, // 5 min
	});
}

export function createRefreshToken(accountId: number): string {
	const secret = process.env['JWT_SECRET'] ?? 'default_dev_secret_that_is_long_enough_32';
	return jwt.sign({ sub: String(accountId), refresh: true }, secret, {
		expiresIn: '30d',
	});
}

/**
 * Verifies and decodes a JWT. Throws a 401 Boom error if invalid or expired.
 */
export function verifyToken(token: string): TokenPayload {
	const secret = process.env['JWT_SECRET'] ?? 'default_dev_secret_that_is_long_enough_32';
	try {
		return jwt.verify(token, secret, { algorithms: ['HS256'] }) as TokenPayload;
	} catch {
		throw unauthorized('Invalid or expired token');
	}
}

export const REFRESH_COOKIE = 'refresh_token';
export const ACCESS_TOKEN_HEADER = 'X-Update-Access-Token';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1_000;

export function setRefreshCookie(res: Response, token: string): void {
	const isProd = process.env['NODE_ENV'] === 'production';
	setCookie(res, REFRESH_COOKIE, token, {
		httpOnly: true,
		maxAge: THIRTY_DAYS_MS / 1_000,
		path: '/api/v1/auth',
		sameSite: isProd ? 'strict' : 'lax',
		secure: isProd,
	});
}

export function clearRefreshCookie(res: Response): void {
	const isProd = process.env['NODE_ENV'] === 'production';
	clearCookie(res, REFRESH_COOKIE, {
		httpOnly: true,
		path: '/api/v1/auth',
		sameSite: isProd ? 'strict' : 'lax',
		secure: isProd,
	});
}

export function setAccessHeader(res: Response, token: string): void {
	res.setHeader(ACCESS_TOKEN_HEADER, token);
}

export function clearAccessHeader(res: Response): void {
	res.setHeader(ACCESS_TOKEN_HEADER, 'noop');
}
