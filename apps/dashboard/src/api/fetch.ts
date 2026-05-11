import { getDefaultStore } from 'jotai';
import { APIError } from './error';
import { accessTokenAtom } from './token';

const ACCESS_TOKEN_HEADER = 'x-update-access-token';

function getBaseURL(): string {
	return process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';
}

export interface FetchOptions {
	body?: unknown;
	headers?: Record<string, string>;
	query?: Record<string, boolean | number | string | undefined>;
}

function buildURL(path: string, query?: FetchOptions['query']): string {
	const url = new URL(path, getBaseURL());
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value));
			}
		}
	}

	return url.toString();
}

async function parseError(response: Response): Promise<APIError> {
	let message = response.statusText || 'Unknown Error';
	try {
		const data = (await response.json()) as { message?: string };
		if (data.message) {
			message = data.message;
		}
	} catch {
		// Ignore
	}

	return new APIError(message, response.status);
}

export async function apiFetch<TResponse = void>(
	method: string,
	path: string,
	options: FetchOptions = {},
): Promise<TResponse> {
	const store = getDefaultStore();
	const accessToken = store.get(accessTokenAtom);

	const headers: Record<string, string> = {
		...(options.body !== undefined && { 'Content-Type': 'application/json' }),
		...(accessToken && { Authorization: `Bearer ${accessToken}` }),
		...options.headers,
	};

	const url = buildURL(path, options.query);

	const fetchInit: RequestInit = {
		method,
		headers,
		credentials: 'include',
	};

	if (options.body !== undefined) {
		fetchInit.body = JSON.stringify(options.body);
	}

	const response = await fetch(url, fetchInit);

	const newToken = response.headers.get(ACCESS_TOKEN_HEADER);
	if (newToken) {
		if (newToken === 'noop') {
			store.set(accessTokenAtom, null);
		} else {
			store.set(accessTokenAtom, newToken);
		}
	}

	if (!response.ok) {
		throw await parseError(response);
	}

	if (response.status === 204 || response.headers.get('Content-Length') === '0') {
		return undefined as TResponse;
	}

	return (await response.json()) as TResponse;
}
