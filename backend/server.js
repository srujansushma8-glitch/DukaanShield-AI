import { app, logger } from './app.js';
import { db } from './data/db.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, msg: `[DukaanShield Backend] AgntID Server running on http://localhost:${PORT}` });
});

// 15s request timeout at server socket level
server.requestTimeout = 15000;

export function handleShutdown(signal = 'SIGTERM') {
  logger.info({ signal, msg: `Received ${signal}, closing server and DB...` });

  server.close((err) => {
    if (err) {
      logger.error({ err, msg: 'Error closing HTTP server' });
      process.exit(1);
    }
    logger.info({ msg: 'HTTP server closed' });

    try {
      if (db && db.open) {
        db.close();
        logger.info({ msg: 'Database connection closed' });
      }
      process.exit(0);
    } catch (dbErr) {
      logger.error({ err: dbErr, msg: 'Error closing database' });
      process.exit(1);
    }
  });

  // Force exit after 5 seconds if graceful close hangs
  setTimeout(() => {
    logger.error({ msg: 'Forced shutdown after timeout' });
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { server };
