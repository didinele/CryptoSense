export type { RouteDefinition, RouteSchema, TypedRequest, HttpMethod } from './core/route.js';
export type { InferRouteContract } from './core/contract.js';
export type { RequestIdentity } from './auth/middleware.js';

export { registerSchema, registerRoute } from './routes/auth/register.js';
export { loginSchema, loginRoute } from './routes/auth/login.js';
export { logoutRoute } from './routes/auth/logout.js';
export { meSchema, meRoute } from './routes/auth/me.js';

export { analyzeSymbolSchema, analyzeSymbolRoute } from './routes/market/analysis.js';
export { sentimentSymbolSchema, sentimentSymbolRoute } from './routes/market/sentiment.js';
export { strategySchema, strategyRoute } from './routes/market/strategy.js';
