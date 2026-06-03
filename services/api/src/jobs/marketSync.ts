import db from '@cryptosense/db';
import cron from 'node-cron';

async function getTrackedSymbols(): Promise<string[]> {
	const rows = await db<{ symbol: string }[]>`SELECT DISTINCT symbol FROM user_symbols`;
	return rows.map((r) => r.symbol);
}

export async function syncMarketData() {
	let syncedCount = 0;
	try {
		const symbols = await getTrackedSymbols();
		if (symbols.length === 0) {
			console.log('[Cron] No tracked symbols, skipping market sync.');
			return;
		}

		console.log(`[Cron] Fetching market data from Binance for ${symbols.join(', ')}...`);
		const responses = await Promise.all(
			symbols.map(async (symbol) =>
				fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then(
					async (res) => res.json() as Promise<{ price: string; symbol: string }>,
				),
			),
		);

		const timestamp = Date.now();

		for (const data of responses) {
			if (data.symbol && data.price) {
				await db`
					INSERT INTO market_data (symbol, price, timestamp)
					VALUES (${data.symbol}, ${Number(data.price)}, ${timestamp})
				`;
				syncedCount++;
			}
		}

		console.log(`[Cron] Successfully synced ${syncedCount} trading pairs.`);
	} catch (error) {
		console.error('[Cron] Failed to sync market data:', error);
	}
}

export function startMarketSyncCron() {
	cron.schedule('*/5 * * * *', () => {
		void syncMarketData();
	});

	console.log('> Market Sync Cron scheduled (every 5 minutes)');
	void syncMarketData();
}
