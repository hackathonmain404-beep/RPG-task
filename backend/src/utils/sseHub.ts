import { Response } from 'express';
import crypto from 'crypto';

/**
 * Server-Sent Events (SSE) Hub
 * 
 * Manages long-lived SSE connections and broadcasts events to all
 * connected clients or targets specific users by userId.
 * 
 * Zero external dependencies — uses native Express Response streams.
 */

interface SSEClient {
  id: string;
  res: Response;
  userId?: string;
}

class SSEHub {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Send heartbeat every 30s to keep connections alive through proxies/load balancers
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client) => {
        try {
          client.res.write(': heartbeat\n\n');
        } catch {
          this.removeClient(client.id);
        }
      });
    }, 30_000);
  }

  /** Register a new SSE client connection */
  addClient(res: Response, userId?: string): string {
    const clientId = crypto.randomUUID();

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection confirmation
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);

    const client: SSEClient = { id: clientId, res, userId };
    this.clients.set(clientId, client);

    // Cleanup when client disconnects
    res.on('close', () => {
      this.removeClient(clientId);
    });

    console.log(`[SSE] Client connected: ${clientId}${userId ? ` (user: ${userId})` : ' (anonymous)'} | Total: ${this.clients.size}`);
    return clientId;
  }

  /** Remove a client from the hub */
  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      try {
        client.res.end();
      } catch {
        // Already closed
      }
      console.log(`[SSE] Client disconnected: ${clientId} | Total: ${this.clients.size}`);
    }
  }

  /** Broadcast an event to ALL connected clients */
  broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    let sent = 0;

    this.clients.forEach((client) => {
      try {
        client.res.write(payload);
        sent++;
      } catch {
        this.removeClient(client.id);
      }
    });

    console.log(`[SSE] Broadcast "${event}" → ${sent}/${this.clients.size} clients`);
  }

  /** Send an event to a SPECIFIC user (by userId) */
  sendToUser(userId: string, event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    let sent = 0;

    this.clients.forEach((client) => {
      if (client.userId === userId) {
        try {
          client.res.write(payload);
          sent++;
        } catch {
          this.removeClient(client.id);
        }
      }
    });

    console.log(`[SSE] Targeted "${event}" → user ${userId} (${sent} connections)`);
  }

  /** Get current connection count */
  get connectionCount(): number {
    return this.clients.size;
  }

  /** Cleanup on server shutdown */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.clients.forEach((client) => {
      try { client.res.end(); } catch { /* ignore */ }
    });
    this.clients.clear();
    console.log('[SSE] Hub shut down.');
  }
}

// Singleton instance shared across the entire backend
export const sseHub = new SSEHub();
