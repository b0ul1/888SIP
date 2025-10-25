import ARI from 'ari-client'
import { config } from './config.js'
import { logger } from './logger.js'

let client = null

/**
 * Initialise la connexion ARI avec Asterisk et enregistre l'application "ttsapp"
 */
export async function initARI() {
  try {
    // Connexion ARI
    const ari = await ARI.connect(config.ari.url, config.ari.user, config.ari.pass)
    client = ari
    logger.info(`Connected to Asterisk ARI at ${config.ari.url}`)

    // === Gestion de l'application ARI "ttsapp" ===
    ari.on('StasisStart', async (event, channel) => {
      const ttsFile = event.args[0] // argument passé par le dialplan
      logger.info(`Channel ${channel.id} entered Stasis app "ttsapp" with file: ${ttsFile}`)

      try {
        // Réponse à l’appel
        await channel.answer()
        // Lecture du fichier TTS
        await channel.play({ media: `sound:tts/${ttsFile.replace('.wav', '')}` })
        // Raccroche après la lecture
        await channel.hangup()
        logger.info(`Playback completed and call ended for ${ttsFile}`)
      } catch (err) {
        logger.error(`ARI playback error for ${ttsFile}: ${err.message}`)
        try { await channel.hangup() } catch {}
      }
    })

    // === Enregistrement de l'application auprès d'Asterisk ===
    ari.start('ttsapp') // le nom doit correspondre à celui du dialplan
    logger.info('ARI application "ttsapp" successfully registered')

    return ari
  } catch (err) {
    logger.error(`Failed to initialize ARI: ${err.message}`)
    throw err
  }
}

/**
 * Retourne le client ARI existant (ou lève une erreur si non initialisé)
 */
export function getARI() {
  if (!client) throw new Error('ARI client not initialized')
  return client
}
