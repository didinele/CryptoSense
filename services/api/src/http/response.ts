import type { ServerResponse as Response } from 'node:http';
import type { SerializeOptions } from 'cookie';
import cookie from 'cookie';

export function appendHeader(res: Response, header: string, value: string[] | number | string): void {
	const current = res.getHeader(header);

	if (current === undefined) {
		res.setHeader(header, value);
		return;
	}

	if (Array.isArray(current)) {
		res.setHeader(header, current.concat(value as string));
		return;
	}

	res.setHeader(header, [current as string].concat(value as string));
}

export function setCookie(res: Response, name: string, data: string, options?: SerializeOptions): void {
	appendHeader(res, 'Set-Cookie', cookie.serialize(name, data, options));
}

export function clearCookie(res: Response, name: string, options?: Omit<SerializeOptions, 'expires'>): void {
	setCookie(res, name, '', {
		...options,
		expires: new Date(0),
	});
}

export function sendJSON(res: Response, status: number, body: unknown): void {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(body));
}
