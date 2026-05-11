import { requireAuth } from '../../auth/middleware.js';
import { clearAccessHeader, clearRefreshCookie } from '../../auth/tokens.js';
import { defineRoute } from '../../core/route.js';
import { sendJSON } from '../../http/response.js';

export const logoutRoute = defineRoute({
	method: 'post',
	path: '/api/v1/auth/logout',
	middleware: [requireAuth] as const,
	handler(_req, res) {
		clearAccessHeader(res);
		clearRefreshCookie(res);

		// End response fully
		res.statusCode = 204;
		res.end();
	},
});
