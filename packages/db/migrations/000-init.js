exports.up = async function (sql) {
	await sql`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`;

	await sql`
		CREATE TABLE IF NOT EXISTS market_data (
			id SERIAL PRIMARY KEY,
			symbol VARCHAR(50) NOT NULL,
			price NUMERIC NOT NULL,
			timestamp BIGINT NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`;
	
	await sql`CREATE INDEX IF NOT EXISTS market_data_symbol_idx ON market_data(symbol);`;
	await sql`CREATE INDEX IF NOT EXISTS market_data_timestamp_idx ON market_data(timestamp);`;
};

exports.down = async function (sql) {
	await sql`DROP TABLE IF EXISTS market_data CASCADE;`;
	await sql`DROP TABLE IF EXISTS users CASCADE;`;
};
