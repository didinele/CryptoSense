import db from '@cryptosense/db';
import cron from 'node-cron';
import Parser from 'rss-parser';

const RSS_FEEDS = [
	{ url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
	{ url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
	{ url: 'https://decrypt.co/feed', source: 'Decrypt' },
];

// Keywords used to assign articles to trading pair symbols
const SYMBOL_KEYWORDS: Record<string, string[]> = {
	BTCUSDT: ['bitcoin', 'btc'],
	ETHUSDT: ['ethereum', 'eth'],
	SOLUSDT: ['solana', 'sol'],
	BNBUSDT: ['bnb', 'binance coin'],
	ADAUSDT: ['cardano', 'ada'],
};

const parser = new Parser({ timeout: 10_000 });

function matchingSymbols(title: string): string[] {
	const lower = title.toLowerCase();
	return Object.entries(SYMBOL_KEYWORDS)
		.filter(([, keywords]) => keywords.some((kw) => lower.includes(kw)))
		.map(([symbol]) => symbol);
}

async function fetchFeed(feedUrl: string): Promise<Parser.Output<Record<string, unknown>>> {
	return parser.parseURL(feedUrl);
}

export async function syncNews(): Promise<void> {
	console.log('[NewsSync] Fetching crypto news from RSS feeds...');
	let totalInserted = 0;

	for (const { url: feedUrl, source } of RSS_FEEDS) {
		let feed: Parser.Output<Record<string, unknown>>;
		try {
			feed = await fetchFeed(feedUrl);
		} catch (error) {
			console.error(`[NewsSync] Failed to fetch RSS feed ${source}:`, error);
			continue;
		}

		for (const item of feed.items) {
			const headline = item.title?.trim();
			const articleUrl = item.link?.trim();
			const publishedAt = item.pubDate ? new Date(item.pubDate) : null;

			if (!headline) continue;

			const symbols = matchingSymbols(headline);
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

	// Prune articles older than 7 days
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
