import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { prisma } from './utils/prisma.js';

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`[Life RPG Server] Running at http://localhost:${PORT}`);
  console.log(`[Life RPG Server] Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`[Life RPG Server] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[Life RPG Server] Closed all database and HTTP connections.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
