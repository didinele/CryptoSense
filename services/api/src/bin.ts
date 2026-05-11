import { mountRoute, startServer } from './core/server.js';
import { loginRoute } from './routes/auth/login.js';
import { logoutRoute } from './routes/auth/logout.js';
import { meRoute } from './routes/auth/me.js';
import { registerRoute } from './routes/auth/register.js';

mountRoute(registerRoute);
mountRoute(loginRoute);
mountRoute(logoutRoute);
mountRoute(meRoute);

startServer();
