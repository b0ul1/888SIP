import fs from 'fs';
import path from 'path';
import textToSpeech from '@google-cloud/text-to-speech';
import { config } from './config.js';
import { logger } from './logger.js';

const client = new textToSpeech.TextToSpeechClient();

export async function synthesizeText(text, lang = 'fr-FR', gender = 'FEMALE') {
  try {
    const req = {
      input: { text },
      voice: { languageCode: lang, ssmlGender: gender },
      audioConfig: { audioEncoding: 'LINEAR16' }
    };
    const [res] = await client.synthesizeSpeech(req);
    const filename = `tts_${Date.now()}.wav`;
    const filePath = path.join(config.soundsDir, filename);

    fs.writeFileSync(filePath, res.audioContent, 'binary');
    logger.info(`TTS generated: ${filename}`);
    return filename;
  } catch (err) {
    logger.error(`TTS generation failed: ${err.message}`);
    throw err;
  }
}
