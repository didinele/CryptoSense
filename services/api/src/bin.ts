import { mountRoute, startServer } from './core/server.js';
import { startMarketSyncCron } from './jobs/marketSync.js';
import { loginRoute } from './routes/auth/login.js';
import { logoutRoute } from './routes/auth/logout.js';
import { meRoute } from './routes/auth/me.js';
import { registerRoute } from './routes/auth/register.js';
import { analyzeSymbolRoute } from './routes/market/analysis.js';

mountRoute(registerRoute);
mountRoute(loginRoute);
mountRoute(logoutRoute);
mountRoute(meRoute);
mountRoute(analyzeSymbolRoute);

startServer();
startMarketSyncCron();
