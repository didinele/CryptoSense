import process from 'node:process';
import polka from 'polka';

const PORT = process.env['PORT'] ?? 3_001;

const app = polka().get('/health', (req, res) => {
	res.end(JSON.stringify({ status: 'ok' }));
});

app.listen(PORT, () => {
	console.log(`> Running on http://localhost:${PORT}`);
});
