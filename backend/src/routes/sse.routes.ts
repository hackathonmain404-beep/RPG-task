import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sseHub } from '../utils/sseHub.js';

export const sseRouter = Router();

/**
 * GET /api/sse/stream
 * 
 * Server-Sent Events endpoint. Clients connect here to receive
 * real-time updates for broadcasts, surge events, shop changes,
 * and feedback replies.
 * 
 * Optional auth: If a valid JWT is provided via ?token= query param,
 * the connection is associated with the userId for targeted events
 * (e.g., feedback replies). Anonymous connections still receive
 * broadcast-level events.
 */
sseRouter.get('/stream', (req: Request, res: Response) => {
  // Extract optional auth token
  let userId: string | undefined;
  const token = req.query.token as string | undefined;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback';
      const decoded = jwt.verify(token, secret) as any;
      userId = decoded.userId || decoded.id || decoded.sub;
    } catch {
      // Invalid token — connect as anonymous (still gets broadcasts/surge)
    }
  }

  // Register this connection with the SSE Hub
  sseHub.addClient(res, userId);

  // Keep the connection open — Express won't close it
  // The sseHub handles cleanup via res.on('close')
});

/**
 * GET /api/sse/status
 * Quick health check for SSE infrastructure
 */
sseRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    connections: sseHub.connectionCount,
    status: 'operational',
  });
});
