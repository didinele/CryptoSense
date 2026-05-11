import type { ServerResponse as Response } from 'node:http';
import process from 'node:process';
import { isBoom } from '@hapi/boom';
import cors from 'cors';
import polka from 'polka';
import type { Request as PolkaRequest } from 'polka';
import { ZodError } from 'zod';
import { jsonParser } from '../http/jsonParser.js';
import { sendJSON } from '../http/response.js';
import type { HttpMethod, RouteDefinition, TypedMiddleware, TypedRequest } from './route.js';

type Request = PolkaRequest & { search?: string | null };

export function createServer() {
	const app = polka({
		onError(err: any, req: Request, res: Response) {
			if (isBoom(err)) {
				sendJSON(res, err.output.statusCode, err.output.payload);
				return;
			}

			console.error(err);
			sendJSON(res, 500, {
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'An internal server error occurred',
			});
		},
		onNoMatch(_req: Request, res: Response) {
			sendJSON(res, 404, {
				statusCode: 404,
				error: 'Not Found',
				message: 'Not Found',
			});
		},
	});

	app.use(cors({
		origin: ['http://localhost:3000'],
		credentials: true,
		exposedHeaders: ['x-update-access-token']
	}));
	app.use(jsonParser() as any);
	return app;
}

export const app = createServer();

export function mountRoute<
	TMethod extends HttpMethod,
	TPath extends string,
	TBody,
	TQuery,
	TParams,
	TResponse,
	TMiddlewares extends readonly TypedMiddleware<any>[],
>(route: RouteDefinition<TMethod, TPath, TBody, TQuery, TParams, TResponse, TMiddlewares>) {
	const handlers = [
		...(route.middleware ?? []),
		async (req: Request, res: Response, next: (err?: any) => void) => {
			try {
				let body = (req as any).body;
				let query = (req as any).query;
				let params = (req as any).params;

				if (route.schema?.body) body = await route.schema.body.parseAsync(body);
				if (route.schema?.query) query = await route.schema.query.parseAsync(query);
				if (route.schema?.params) params = await route.schema.params.parseAsync(params);

				(req as any).body = body;
				(req as any).query = query;
				(req as any).params = params;

				const typedReq = req as unknown as TypedRequest<TBody, TQuery, TParams, any>;
				const responseData = await route.handler(typedReq, res);

				if (!res.headersSent && responseData !== undefined) {
					sendJSON(res, 200, responseData);
				}
			} catch (err) {
				if (err instanceof ZodError) {
					sendJSON(res, 400, { statusCode: 400, error: 'Bad Request', message: err.issues });
					return;
				}

				// eslint-disable-next-line n/callback-return
				next(err);
			}
		},
	];

	app[route.method](route.path, ...(handlers as any[]));
}

export function startServer() {
	const PORT = process.env['PORT'] ?? 3_001;
	app.listen(PORT, () => {
		console.log(`> Running on http://localhost:${PORT}`);
	});
}
