import ARI from 'ari-client';
import { config } from './config.js';
import { logger } from './logger.js';

let client = null;

export async function initARI() {
  client = await ARI.connect(config.ari.url, config.ari.user, config.ari.pass);
  logger.info('Connected to Asterisk ARI');
  return client;
}

export function getARI() {
  if (!client) throw new Error('ARI client not initialized');
  return client;
}
