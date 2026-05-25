import app from './app.js';
import { logger } from './shared/logger/logger.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  logger.info('Shutting down...');
  server.close();
  process.exit(0);
});

export default server;
