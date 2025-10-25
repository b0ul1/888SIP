import fs from 'fs'
import path from 'path'
import textToSpeech from '@google-cloud/text-to-speech'
import { config } from './config.js'
import { logger } from './logger.js'

const client = new textToSpeech.TextToSpeechClient()

/**
 * Génère un fichier audio TTS à partir d'un texte (compatible Asterisk)
 * @param {string} text - Texte à convertir en audio
 * @param {string} lang - Langue du TTS (par défaut fr-FR)
 * @param {string} gender - Genre de voix (MALE/FEMALE/NEUTRAL)
 * @returns {string} Nom du fichier .wav généré
 */
export async function synthesizeText(text, lang = 'fr-FR', gender = 'MALE') {
  try {
    const req = {
      input: { text },
      voice: {
        languageCode: lang,
        name: 'fr-FR-Wavenet-A', // voix utilisée
        ssmlGender: gender
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',   // PCM 16-bit
        sampleRateHertz: 8000,       // ✅ compatible Asterisk G.711 (uLaw/alaw)
        speakingRate: 1.0,           // vitesse normale
        pitch: 0.0                   // ton neutre
      }
    }

    const [res] = await client.synthesizeSpeech(req)
    const filename = `tts_${Date.now()}.wav`
    const filePath = path.join(config.soundsDir, filename)

    fs.mkdirSync(config.soundsDir, { recursive: true })
    fs.writeFileSync(filePath, res.audioContent, 'binary')

    logger.info(`🎤 TTS generated: ${filename} (voice: fr-FR-Wavenet-A, 8kHz PCM)`)
    return filename
  } catch (err) {
    logger.error(`❌ TTS generation failed: ${err.message}`)
    throw err
  }
}
