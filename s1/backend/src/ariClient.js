import ARI from 'ari-client';
import { config } from './config.js';
import { logger } from './logger.js';

let client = null;

/**
 * Initialise la connexion ARI avec Asterisk
 */
export async function initARI() {
  client = await ARI.connect(config.ari.url, config.ari.user, config.ari.pass);
  logger.info(`Connected to Asterisk ARI at ${config.ari.url}`);
  return client;
}

/**
 * Retourne le client ARI existant (ou lève une erreur si non initialisé)
 */
export function getARI() {
  if (!client) throw new Error('ARI client not initialized');
  return client;
}
