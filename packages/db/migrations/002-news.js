exports.up = async function (sql) {
	await sql`
		CREATE TABLE IF NOT EXISTS news_data (
			id SERIAL PRIMARY KEY,
			symbol VARCHAR(50) NOT NULL,
			headline TEXT NOT NULL,
			source VARCHAR(255),
			url TEXT,
			published_at TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (url, symbol)
		);
	`;

	await sql`CREATE INDEX IF NOT EXISTS news_data_symbol_idx ON news_data(symbol);`;
	await sql`CREATE INDEX IF NOT EXISTS news_data_published_at_idx ON news_data(published_at);`;
};

exports.down = async function (sql) {
	await sql`DROP TABLE IF EXISTS news_data CASCADE;`;
};
