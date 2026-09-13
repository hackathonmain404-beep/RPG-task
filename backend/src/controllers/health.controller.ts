import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let dbStatus = 'connected';
  let isDbOk = true;

  try {
    await prisma.$queryRaw`SELECT 1;`;
  } catch (err) {
    dbStatus = 'disconnected';
    isDbOk = false;
  }

  const statusCode = isDbOk ? 200 : 503;

  res.status(statusCode).json({
    status: isDbOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    version: '1.0.0',
  });
}
