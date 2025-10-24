import pkg from 'pg';
import { config } from './config.js';
import { logger } from './logger.js';

const { Pool } = pkg;
const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name
});

/**
 * Récupère tous les bots
 */
export async function getAllBots(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM bots ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Récupère un bot par ID
 */
export async function getBotById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM bots WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Bot not found' });
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Crée un nouveau bot
 */
export async function createBot(req, res) {
  try {
    const { name, message, voice, target_number, schedule_cron, active } = req.body;

    if (!name || !message || !target_number)
      return res.status(400).json({ error: 'Missing required fields (name, message, target_number)' });

    const query = `
      INSERT INTO bots (name, message, voice, target_number, schedule_cron, active)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`;
    const values = [name, message, voice || 'fr-FR-Female', target_number, schedule_cron || null, active ?? true];
    const { rows } = await pool.query(query, values);

    logger.info(`Bot created: ${rows[0].name}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Met à jour un bot existant
 */
export async function updateBot(req, res) {
  try {
    const { id } = req.params;
    const { name, message, voice, target_number, schedule_cron, active } = req.body;

    const query = `
      UPDATE bots
      SET name = COALESCE($1,name),
          message = COALESCE($2,message),
          voice = COALESCE($3,voice),
          target_number = COALESCE($4,target_number),
          schedule_cron = COALESCE($5,schedule_cron),
          active = COALESCE($6,active),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *`;
    const values = [name, message, voice, target_number, schedule_cron, active, id];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: 'Bot not found' });

    logger.info(`Bot updated: ${rows[0].name}`);
    res.json(rows[0]);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Supprime un bot
 */
export async function deleteBot(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM bots WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Bot not found' });
    logger.info(`Bot deleted: ${id}`);
    res.json({ success: true });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ error: err.message });
  }
}
