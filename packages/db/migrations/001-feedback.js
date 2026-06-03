exports.up = async function (sql) {
	await sql`
		CREATE TABLE IF NOT EXISTS ai_feedback (
			id SERIAL PRIMARY KEY,
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			symbol VARCHAR(50) NOT NULL,
			recommendation VARCHAR(10) NOT NULL,
			feedback VARCHAR(10) NOT NULL CHECK (feedback IN ('positive', 'negative')),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		);
	`;

	await sql`CREATE INDEX IF NOT EXISTS ai_feedback_user_id_idx ON ai_feedback(user_id);`;
	await sql`CREATE INDEX IF NOT EXISTS ai_feedback_symbol_idx ON ai_feedback(symbol);`;
};

exports.down = async function (sql) {
	await sql`DROP TABLE IF EXISTS ai_feedback CASCADE;`;
};
