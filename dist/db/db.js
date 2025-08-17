var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
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
const connectionString = (_a = process.env) === null || _a === void 0 ? void 0 : _a.DATABASE_URL;
if (!connectionString) {
    logger.error('No connection string');
    process.exit(1);
}
export const pool = new pg.Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? true : sslConfig,
});
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
export function query(q_1) {
    return __awaiter(this, arguments, void 0, function* (q, values = []) {
        let client;
        try {
            client = yield pool.connect();
        }
        catch (e) {
            console.error('unable to get client from pool', e);
            return null;
        }
        try {
            const result = values.length === 0 ? yield client.query(q) : yield client.query(q, values);
            return result;
        }
        catch (e) {
            console.error('unable to query', e);
            console.info(q, values);
            return null;
        }
        finally {
            client.release();
        }
    });
}
export function createSchema() {
    return __awaiter(this, arguments, void 0, function* (schemaFile = SCHEMA_FILE) {
        const data = yield readFile(schemaFile);
        return query(data.toString('utf-8'));
    });
}
export function dropSchema() {
    return __awaiter(this, arguments, void 0, function* (dropFile = DROP_SCHEMA_FILE) {
        const data = yield readFile(dropFile);
        return query(data.toString('utf-8'));
    });
}
export function getNextPattern() {
    return __awaiter(this, void 0, void 0, function* () {
        const q = `SELECT * FROM Pattern WHERE status = FALSE AND vel_id = ${process.env.vel_id} ORDER BY id ASC LIMIT 1;`;
        const result = yield query(q);
        return result && result.rows[0] || null;
    });
}
export function setPatternStatusDone(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = `
	UPDATE Pattern
	SET status = TRUE
	WHERE id = $1
	RETURNING status;`;
        const result = yield query(q, [id]);
        return result && result.rows[0] || null;
    });
}
export function deletePattern(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = `
	DELETE FROM Pattern WHERE id = $1;
	`;
        const result = yield query(q, [id]);
        return result && result.rows[0] || null;
    });
}
export function insertPattern(pattern_matrix, vel_id, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = `
	INSERT INTO Pattern(pattern_matrix, vel_id, username, status) VALUES ($1, $2, $3, $4) RETURNING id;
	`;
        const result = yield query(q, [`{${pattern_matrix}`, vel_id, username]);
        return result && result.rows[0] || null;
    });
}
export function insertVel(id, password, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const q = `
	INSERT INTO Velar(id,password,status) VALUES ($1, $2, $3) RETURNING id;
	`;
        const result = yield query(q, [id, password, status]);
        return result && result.rows[0] || null;
    });
}
//# sourceMappingURL=db.js.map