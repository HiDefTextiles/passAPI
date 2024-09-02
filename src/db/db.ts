import { readFile } from 'fs/promises';
import { logger } from './logger.js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const SCHEMA_FILE = './src/db/sql/schema.sql';
const DROP_SCHEMA_FILE = './src/db/sql/drop.sql';

const sslConfig = {
	rejectUnauthorized: false,
};

const connectionString = process.env?.DATABASE_URL

if (!connectionString) {
	logger.error('No connection string');
	process.exit(1);
}

export const pool = new pg.Pool({
	connectionString,
	ssl: process.env.NODE_ENV === 'production' ? true : sslConfig,
});

pool.on('error', (err: Error) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

export async function query(q: string, values: Array<number | string | boolean | Date | null> = []) {
	let client;
	try {
		client = await pool.connect();
	} catch (e) {
		console.error('unable to get client from pool', e);
		return null;
	}

	try {
		const result = values.length === 0 ? await client.query(q) : await client.query(q, values);
		return result;
	} catch (e) {
		console.error('unable to query', e);
		console.info(q, values);
		return null;
	} finally {
		client.release();
	}
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
	const data = await readFile(schemaFile);
	return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
	const data = await readFile(dropFile);
	return query(data.toString('utf-8'));
}

export async function getNextPattern(): Promise<{ id: number, image_URL: string | null, matrix: string, status: boolean, vel_id: number, username: string }> {
	const q = `SELECT * FROM Pattern WHERE status = FALSE AND vel_id = ${process.env.vel_id} ORDER BY id ASC LIMIT 1;`
	const result = await query(q)
	return result && result.rows[0] || null;
}

export async function setPatternStatusDone(id: number) {
	const q = `
	UPDATE Pattern
	SET status = TRUE
	WHERE id = $1
	RETURNING status;`;
	const result = await query(q, [id]);
	return result && result.rows[0] || null;
}

export async function deletePattern(id: number) {
	const q =
		`
	DELETE FROM Pattern WHERE id = $1;
	`;
	const result = await query(q, [id]);
	return result && result.rows[0] || null;
}

export async function insertPattern(pattern_matrix: Array<string>, vel_id: number, username: string) {
	const q = `
	INSERT INTO Pattern(pattern_matrix, vel_id, username, status) VALUES ($1, $2, $3, $4) RETURNING id;
	`
	const result = await query(q, [`{${pattern_matrix}`, vel_id, username]);
	return result && result.rows[0] || null;
}

export async function insertVel(id: number, password: string, status: boolean) {
	const q = `
	INSERT INTO Velar(id,password,status) VALUES ($1, $2, $3) RETURNING id;
	`
	const result = await query(q, [id, password, status]);
	return result && result.rows[0] || null;
}