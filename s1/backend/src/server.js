import cors from 'cors';
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
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const realtime = initRealtime(io);

// Connect to Asterisk ARI
await initARI();
await initScheduler();  

// API routes
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.get('/api/bots', getAllBots);
app.get('/api/bots/:id', getBotById);
app.post('/api/bots', createBot);
app.put('/api/bots/:id', updateBot);
app.delete('/api/bots/:id', deleteBot);

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

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

server.listen(config.port, '0.0.0.0', () => {
  logger.info(`backend running on 0.0.0.0:${config.port}`);
});
