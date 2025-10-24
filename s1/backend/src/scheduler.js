import cron from 'node-cron';
import pkg from 'pg';
import { startCall } from './callService.js';
import { logger } from './logger.js';
import { config } from './config.js';

const { Pool } = pkg;
const pool = new Pool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.pass,
  database: config.db.name
});

/**
 * Charge tous les bots actifs depuis la base de données.
 */
async function fetchActiveBots() {
  const res = await pool.query(
    'SELECT id, name, message, target_number, schedule_cron FROM bots WHERE active = TRUE'
  );
  return res.rows;
}

/**
 * Logue les événements système dans la table system_events.
 */
async function logSystemEvent(eventType, payload = {}) {
  try {
    await pool.query(
      'INSERT INTO system_events(event_type, payload) VALUES($1,$2)',
      [eventType, payload]
    );
  } catch (err) {
    logger.error(`Failed to log system event: ${err.message}`);
  }
}

/**
 * Lance un appel automatisé pour un bot donné.
 */
async function executeBot(bot) {
  try {
    logger.info(`Executing bot [${bot.name}] -> ${bot.target_number}`);
    await logSystemEvent('BOT_TRIGGERED', { botId: bot.id, number: bot.target_number });
    const result = await startCall(bot.target_number, bot.message);
    await logSystemEvent('CALL_STARTED', result);
  } catch (err) {
    logger.error(`Bot [${bot.name}] failed: ${err.message}`);
    await logSystemEvent('CALL_FAILED', { botId: bot.id, error: err.message });
  }
}

/**
 * Planifie un bot à partir de sa règle CRON.
 */
function scheduleBot(bot) {
  if (!bot.schedule_cron) {
    logger.warn(`Bot [${bot.name}] has no schedule_cron defined`);
    return;
  }

  try {
    cron.schedule(bot.schedule_cron, async () => {
      await executeBot(bot);
    });
    logger.info(`Scheduled bot [${bot.name}] with rule "${bot.schedule_cron}"`);
  } catch (err) {
    logger.error(`Invalid CRON for bot [${bot.name}]: ${err.message}`);
  }
}

/**
 * Initialise tous les bots planifiés.
 */
export async function initScheduler() {
  const bots = await fetchActiveBots();
  if (bots.length === 0) {
    logger.warn('No active bots found in database');
    return;
  }

  logger.info(`Initializing ${bots.length} scheduled bots...`);
  for (const bot of bots) scheduleBot(bot);
}
