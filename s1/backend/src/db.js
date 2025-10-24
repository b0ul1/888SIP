import pkg from 'pg';
import { logger } from './logger.js';
import { config } from './config.js';
const { Pool } = pkg;

const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name
});

export async function logCall({ number, status, start, end, ttsFile }) {
  try {
    await pool.query(
      `INSERT INTO calls (number, status, start_time, end_time, transcript)
       VALUES ($1,$2,$3,$4,$5)`,
      [number, status, start, end, ttsFile]
    );
  } catch (err) {
    logger.error(`DB insert failed: ${err.message}`);
  }
}

export async function updateStatus(number, status) {
  try {
    await pool.query('UPDATE calls SET status=$1 WHERE number=$2', [status, number]);
  } catch (err) {
    logger.error(`DB update failed: ${err.message}`);
  }
}
