import process from 'node:process';
import polka from 'polka';

const PORT = process.env['PORT'] ?? 3_001;

const app = polka()
	.get('/health', (req, res) => {
		res.end(JSON.stringify({ status: 'ok' }));
	})
	.post('/auth/register', (req, res) => {
		// MVP Placeholder for Auth
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ success: true, message: 'Register placeholder' }));
	})
	.post('/auth/login', (req, res) => {
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ success: true, token: 'mock-jwt-token' }));
	})
	.post('/market/sync', (req, res) => {
		// Mock syncing data
		res.writeHead(200, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ success: true, message: 'Market data synced successfully' }));
	});

app.listen(PORT, () => {
	console.log(`> Running on http://localhost:${PORT}`);
});
