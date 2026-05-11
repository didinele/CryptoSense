/* eslint-disable @typescript-eslint/no-confusing-void-expression */

import type { Buffer } from 'node:buffer';
import type { ServerResponse as Response } from 'node:http';
import { unsupportedMediaType, badRequest } from '@hapi/boom';
import type { Request } from 'polka';

export function jsonParser(options: { limit?: number } = {}) {
	const limit = options.limit ?? 1_024 * 1_024; // 1MB default

	return async (req: Request, res: Response, next: (err?: any) => void) => {
		const contentType = req.headers['content-type'];

		if (!contentType?.includes('application/json')) {
			const hasBodyBytes = req.headers['content-length'] && req.headers['content-length'] !== '0';
			if (hasBodyBytes) {
				next(unsupportedMediaType('Expected application/json'));
				return;
			}

			return next();
			return;
		}

		let body = '';
		let length = 0;

		try {
			for await (const chunk of req as any) {
				body += chunk;
				length += (chunk as Buffer | string).length;
				if (length > limit) {
					next(badRequest('Payload Too Large'));
					return;
				}
			}

			if (body) {
				(req as any).body = JSON.parse(body);
			}

			return next();
		} catch (err: any) {
			// eslint-disable-next-line n/callback-return
			next(badRequest(err.message));
		}
	};
}
