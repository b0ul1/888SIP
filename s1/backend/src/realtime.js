import { logger } from './logger.js';

export function initRealtime(io) {
  io.on('connection', socket => {
    logger.info(`Dashboard connected: ${socket.id}`);
  });

  return {
    emit: (event, data) => io.emit(event, data)
  };
}
