import { synthesizeText } from './ttsService.js';
import ARI from 'ari-client';
import { logCall, updateStatus } from './db.js';
import { logger } from './logger.js';

export async function startCall(number, message) {
  const ari = getARI();
  const ttsFile = await synthesizeText(message);
  const startTime = new Date();

  await logCall({ number, status: 'initiated', start: startTime, end: null, ttsFile });

  try {
    const channel = await ari.channels.originate({
      endpoint: `PJSIP/${number}`,
      app: 'ttsapp',
      appArgs: ttsFile,
      callerId: 'AutoDialer <1000>'
    });

    logger.info(`Call started to ${number} using ${ttsFile}`);

    channel.on('StasisStart', () => updateStatus(number, 'in_progress'));
    channel.on('StasisEnd', async () => {
      await updateStatus(number, 'completed');
      const endTime = new Date();
      await logCall({ number, status: 'completed', start: startTime, end: endTime, ttsFile });
      logger.info(`Call to ${number} completed`);
    });

    return { number, ttsFile, status: 'initiated' };
  } catch (err) {
    logger.error(`Call failed: ${err.message}`);
    await updateStatus(number, 'failed');
    throw err;
  }
}
