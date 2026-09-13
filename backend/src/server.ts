import dotenv from 'dotenv';
dotenv.config();
// Server reloaded with strict authentication order

import { app } from './app.js';
import { prisma } from './utils/prisma.js';
import { startChatCleanupWorker, stopChatCleanupWorker } from './services/chatCleanup.service.js';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`[Life RPG Server] Running at http://localhost:${PORT}`);
  console.log(`[Life RPG Server] Health check: http://localhost:${PORT}/api/health`);

  // Start the 3-day community chat message retention cleanup worker
  startChatCleanupWorker();
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`[Life RPG Server] Received ${signal}. Shutting down gracefully...`);
  stopChatCleanupWorker();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[Life RPG Server] Closed all database and HTTP connections.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

