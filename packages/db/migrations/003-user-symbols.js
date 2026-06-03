exports.up = async function (sql) {
	await sql`
		CREATE TABLE IF NOT EXISTS user_symbols (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			symbol VARCHAR(50) NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
			UNIQUE (user_id, symbol)
		);
	`;

	await sql`CREATE INDEX IF NOT EXISTS user_symbols_user_id_idx ON user_symbols(user_id);`;
	await sql`CREATE INDEX IF NOT EXISTS user_symbols_symbol_idx ON user_symbols(symbol);`;
};

exports.down = async function (sql) {
	await sql`DROP TABLE IF EXISTS user_symbols CASCADE;`;
};
