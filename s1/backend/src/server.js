import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { initARI } from './ariClient.js';
import { startCall } from './callService.js';
import { initRealtime } from './realtime.js';
import { logger } from './logger.js';
import { initScheduler } from './scheduler.js';
import {
  getAllBots,
  getBotById,
  createBot,
  updateBot,
  deleteBot
} from './botController.js';


const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const realtime = initRealtime(io);

// Connect to Asterisk ARI
await initARI();
await initScheduler();  

// API routes
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.post('/api/call/start', async (req, res) => {
  const { number, text } = req.body;
  if (!number || !text)
    return res.status(400).json({ error: 'number and text are required' });

  try {
    const result = await startCall(number, text);
    realtime.emit('call_started', result);
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

server.listen(config.port, () => {
  logger.info(`Backend running on port ${config.port}`);
});
