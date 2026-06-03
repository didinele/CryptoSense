import db from '@cryptosense/db';
import cron from 'node-cron';
import Parser from 'rss-parser';

const RSS_FEEDS = [
	{ url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
	{ url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
	{ url: 'https://decrypt.co/feed', source: 'Decrypt' },
];

// Strip quote currency to get the base ticker (e.g. BTCUSDT → btc, DOGEUSDT → doge)
const QUOTE_CURRENCIES = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];

function deriveKeywords(symbol: string): string[] {
	for (const quote of QUOTE_CURRENCIES) {
		if (symbol.endsWith(quote)) {
			return [symbol.slice(0, -quote.length).toLowerCase()];
		}
	}

	return [symbol.toLowerCase()];
}

async function getTrackedSymbols(): Promise<Map<string, string[]>> {
	const rows = await db<{ symbol: string }[]>`SELECT DISTINCT symbol FROM user_symbols`;
	return new Map(rows.map((r) => [r.symbol, deriveKeywords(r.symbol)]));
}

const parser = new Parser({ timeout: 10_000 });

function matchingSymbols(title: string, symbolKeywords: Map<string, string[]>): string[] {
	const lower = title.toLowerCase();
	return [...symbolKeywords.entries()]
		.filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
		.map(([symbol]) => symbol);
}

export async function syncNews(): Promise<void> {
	const symbolKeywords = await getTrackedSymbols();
	if (symbolKeywords.size === 0) {
		console.log('[NewsSync] No tracked symbols, skipping news sync.');
		return;
	}

	console.log('[NewsSync] Fetching crypto news from RSS feeds...');
	let totalInserted = 0;

	for (const { url: feedUrl, source } of RSS_FEEDS) {
		let feed: Parser.Output<Record<string, unknown>>;
		try {
			feed = await parser.parseURL(feedUrl);
		} catch (error) {
			console.error(`[NewsSync] Failed to fetch RSS feed ${source}:`, error);
			continue;
		}

		for (const item of feed.items) {
			const headline = item.title?.trim();
			const articleUrl = item.link?.trim();
			const publishedAt = item.pubDate ? new Date(item.pubDate) : null;

			if (!headline) continue;

			const symbols = matchingSymbols(headline, symbolKeywords);
			if (symbols.length === 0) continue;

			for (const symbol of symbols) {
				try {
					const result = await db`
						INSERT INTO news_data (symbol, headline, source, url, published_at)
						VALUES (${symbol}, ${headline}, ${source}, ${articleUrl ?? null}, ${publishedAt})
						ON CONFLICT (url, symbol) DO NOTHING
					`;
					if (result.count > 0) totalInserted++;
				} catch (error) {
					console.error(`[NewsSync] Failed to insert article for ${symbol}:`, error);
				}
			}
		}
	}

	await db`DELETE FROM news_data WHERE published_at < NOW() - INTERVAL '7 days'`;

	console.log(`[NewsSync] Done. Inserted ${totalInserted} new articles.`);
}

export function startNewsSyncCron(): void {
	cron.schedule('*/15 * * * *', () => {
		void syncNews();
	});

	console.log('> News Sync Cron scheduled (every 15 minutes)');
	void syncNews();
}
