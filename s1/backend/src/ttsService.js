import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import textToSpeech from '@google-cloud/text-to-speech'
import { config } from './config.js'
import { logger } from './logger.js'

const client = new textToSpeech.TextToSpeechClient()

export async function synthesizeText(text, lang = 'fr-FR', gender = 'MALE') {
  try {
    const req = {
      input: { text },
      voice: {
        languageCode: lang,
        name: 'fr-FR-Wavenet-A',
        ssmlGender: gender
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 8000,
        speakingRate: 1.0,
        pitch: 0.0
      }
    }

    const [res] = await client.synthesizeSpeech(req)
    const filename = `tts_${Date.now()}.wav`
    const filePath = path.join(config.soundsDir, filename)

    fs.mkdirSync(config.soundsDir, { recursive: true })
    fs.writeFileSync(filePath, res.audioContent, 'binary')
    logger.info(`🎤 Raw TTS generated: ${filename}`)

    // ✅ Conversion stricte vers PCM 16-bit mono 8 kHz
    try {
      execSync(`sox "${filePath}" -r 8000 -c 1 -e signed-integer "${filePath}"`, { stdio: 'ignore' })
      logger.info(`🔊 Converted ${filename} to Asterisk-compatible format`)
    } catch (e) {
      logger.warn(`⚠️ Sox conversion failed: ${e.message}`)
    }

    return filename
  } catch (err) {
    logger.error(`❌ TTS generation failed: ${err.message}`)
    throw err
  }
}
