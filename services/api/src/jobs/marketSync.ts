import db from '@cryptosense/db';
import cron from 'node-cron';

// Target symbols to sync from Binance
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT'];

export async function syncMarketData() {
	let syncedCount = 0;
	try {
		console.log('[Cron] Fetching market data from Binance...');
		// Fetch data from Binance for target symbols
		const responses = await Promise.all(
			SYMBOLS.map(async (symbol) =>
				fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`)
					.then(async (res) => res.json() as Promise<{ price: string, symbol: string; }>),
			),
		);

		const timestamp = Date.now();

		// Insert into the database
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
	// Rulează la fiecare 5 minute
	cron.schedule('*/5 * * * *', () => {
		void syncMarketData();
	});
	
	console.log('> Market Sync Cron scheduled (every 5 minutes)');
	
	// Opțional: Facem și un prim sync imediat cum pornește serverul
	void syncMarketData();
}