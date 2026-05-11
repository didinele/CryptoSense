import type { ServerResponse as Response } from 'node:http';
import type { Middleware, Request as PolkaRequest } from 'polka';
import type { z } from 'zod';

type Request = PolkaRequest & { search?: string | null };

export type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

export type TypedRequest<
	TBody = unknown,
	TQuery = unknown,
	TParams = unknown,
	TMiddlewareContext extends object = object,
> = Request &
	TMiddlewareContext & {
		body: TBody;
		params: TParams;
		query: TQuery;
	};

export interface TypedMiddleware<TContext extends object> extends Middleware {
	__contextType?: TContext;
}

export type MergeContexts<TMiddlewares extends readonly TypedMiddleware<any>[]> = TMiddlewares extends readonly [
	TypedMiddleware<infer TFirst>,
	...infer TRest,
]
	? MergeContexts<TRest extends readonly TypedMiddleware<any>[] ? TRest : []> & TFirst
	: object;

export interface RouteSchema<TBody = any, TQuery = any, TParams = any, TResponse = any> {
	body?: z.ZodType<TBody>;
	params?: z.ZodType<TParams>;
	query?: z.ZodType<TQuery>;
	response?: z.ZodType<TResponse>;
}

export interface RouteDefinition<
	TMethod extends HttpMethod,
	TPath extends string,
	TBody,
	TQuery,
	TParams,
	TResponse,
	TMiddlewares extends readonly TypedMiddleware<any>[],
> {
	handler(
		req: TypedRequest<TBody, TQuery, TParams, MergeContexts<TMiddlewares>>,
		res: Response,
	): Promise<TResponse> | TResponse;
	method: TMethod;
	middleware?: TMiddlewares;
	path: TPath;
	schema?: RouteSchema<TBody, TQuery, TParams, TResponse>;
}

export function defineRoute<
	TMethod extends HttpMethod,
	TPath extends string,
	TBody = unknown,
	TQuery = unknown,
	TParams = unknown,
	TResponse = void,
	TMiddlewares extends readonly TypedMiddleware<any>[] = readonly never[],
>(
	def: RouteDefinition<TMethod, TPath, TBody, TQuery, TParams, TResponse, TMiddlewares>,
): RouteDefinition<TMethod, TPath, TBody, TQuery, TParams, TResponse, TMiddlewares> {
	return def;
}

export function defineMiddleware<TContext extends object = object>(
	handler: (req: Request, res: Response, next: (err?: Error | string | null) => void) => Promise<void> | void,
): TypedMiddleware<TContext> {
	return handler as any as TypedMiddleware<TContext>;
}
