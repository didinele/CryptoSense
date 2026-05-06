import process from 'node:process';
import postgres from 'postgres';

const sql = postgres(process.env['DATABASE_URL'] ?? 'postgres://postgres:postgres@localhost:5432/cryptosense', {
	max: 10,
});

export default sql;
