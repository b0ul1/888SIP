import { synthesizeText } from './ttsService.js';
import { getARI } from './ariClient.js';       // ✅ ajout correct
import { logCall, updateStatus } from './db.js';
import { logger } from './logger.js';

/**
 * Démarre un appel automatisé vers un numéro donné
 * @param {string} number - numéro SIP ou extension (ex: "1001")
 * @param {string} message - texte à convertir en TTS
 */
export async function startCall(number, message) {
  const ari = getARI();                        // ✅ accessible maintenant
  const ttsFile = await synthesizeText(message);
  const startTime = new Date();

  await logCall({
    number,
    status: 'initiated',
    start: startTime,
    end: null,
    ttsFile
  });

  try {
    const channel = await ari.channels.originate({
      endpoint: `PJSIP/${number}`,
      app: 'ttsapp',
      appArgs: ttsFile,
      callerId: 'AutoDialer <1000>'
    });

    logger.info(`📞 Call started to ${number} using file ${ttsFile}`);

    // Quand l'appel commence
    channel.on('StasisStart', () => updateStatus(number, 'in_progress'));

    // Quand l'appel se termine
    channel.on('StasisEnd', async () => {
      const endTime = new Date();
      await updateStatus(number, 'completed');
      await logCall({
        number,
        status: 'completed',
        start: startTime,
        end: endTime,
        ttsFile
      });
      logger.info(`✅ Call to ${number} completed`);
    });

    return { number, ttsFile, status: 'initiated' };
  } catch (err) {
    logger.error(`❌ Call failed to ${number}: ${err.message}`);
    await updateStatus(number, 'failed');
    throw err;
  }
}
