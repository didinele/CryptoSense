import { mountRoute, startServer } from './core/server.js';
import { startMarketSyncCron } from './jobs/marketSync.js';
import { startNewsSyncCron } from './jobs/newsSync.js';
import { loginRoute } from './routes/auth/login.js';
import { logoutRoute } from './routes/auth/logout.js';
import { meRoute } from './routes/auth/me.js';
import { registerRoute } from './routes/auth/register.js';
import { analyzeSymbolRoute } from './routes/market/analysis.js';
import { feedbackRoute } from './routes/market/feedback.js';
import { sentimentSymbolRoute } from './routes/market/sentiment.js';
import { strategyRoute } from './routes/market/strategy.js';
import { addUserSymbolRoute, getUserSymbolsRoute, removeUserSymbolRoute } from './routes/user/symbols.js';

mountRoute(registerRoute);
mountRoute(loginRoute);
mountRoute(logoutRoute);
mountRoute(meRoute);
mountRoute(analyzeSymbolRoute);
mountRoute(sentimentSymbolRoute);
mountRoute(strategyRoute);
mountRoute(feedbackRoute);
mountRoute(getUserSymbolsRoute);
mountRoute(addUserSymbolRoute);
mountRoute(removeUserSymbolRoute);

startServer();
startMarketSyncCron();
startNewsSyncCron();
