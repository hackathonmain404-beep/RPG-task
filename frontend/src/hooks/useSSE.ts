import { useEffect, useRef } from 'react';

/**
 * Event types emitted by the SSE server
 */
export type SSEEventType =
  | 'broadcast:update'
  | 'broadcast:dismiss'
  | 'surge:update'
  | 'feedback:reply'
  | 'shop:update'
  | 'chat:message';

export type SSEHandlers = Partial<Record<SSEEventType, (data: any) => void>>;

/* ==========================================================================
   SINGLETON SSE CLIENT
   Manages a single persistent EventSource connection shared by all components.
   Prevents browser connection exhaustion (HTTP/1.1 6-connection limit).
   ========================================================================== */

class SSEManager {
  private eventSource: EventSource | null = null;
  private subscribers: Set<SSEHandlers> = new Set();
  private activeCount: number = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;

  private getSSEUrl(): string {
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const token = localStorage.getItem('auth_token');
    this.currentToken = token;
    return token
      ? `${cleanBase}/sse/stream?token=${encodeURIComponent(token)}`
      : `${cleanBase}/sse/stream`;
  }

  private connect() {
    if (typeof EventSource === 'undefined') return;
    if (this.eventSource) {
      this.disconnect();
    }

    const url = this.getSSEUrl();
    try {
      const es = new EventSource(url);
      this.eventSource = es;

      const eventTypes: SSEEventType[] = [
        'broadcast:update',
        'broadcast:dismiss',
        'surge:update',
        'feedback:reply',
        'shop:update',
        'chat:message',
      ];

      eventTypes.forEach((eventType) => {
        es.addEventListener(eventType, (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            this.subscribers.forEach((handlers) => {
              try {
                handlers[eventType]?.(data);
              } catch (hErr) {
                console.error(`[SSE] Handler error for "${eventType}":`, hErr);
              }
            });
          } catch (err) {
            console.warn(`[SSE] Failed to parse "${eventType}" event:`, err);
          }
        });
      });

      es.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Shared stream connected:', data.clientId);
        } catch {
          // ignore
        }
      });

      es.onerror = () => {
        // EventSource auto-reconnects natively; log only
        console.log('[SSE] Stream interrupted — auto-reconnecting...');
      };
    } catch (err) {
      console.warn('[SSE] Failed to initialize EventSource:', err);
    }
  }

  private disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public subscribe(handlers: SSEHandlers): () => void {
    this.subscribers.add(handlers);
    this.activeCount++;

    // Connect if this is the first active subscriber
    if (!this.eventSource) {
      this.connect();
    } else {
      // If token changed while already connected, reconnect with updated auth
      const token = localStorage.getItem('auth_token');
      if (token !== this.currentToken) {
        this.connect();
      }
    }

    return () => {
      this.subscribers.delete(handlers);
      this.activeCount = Math.max(0, this.activeCount - 1);

      // If no more subscribers, gracefully close connection after 5 seconds
      // (Grace period prevents rapid connect/disconnect on route changes)
      if (this.activeCount === 0) {
        this.reconnectTimeout = setTimeout(() => {
          if (this.activeCount === 0) {
            this.disconnect();
          }
        }, 5000);
      }
    };
  }
}

const sseManager = new SSEManager();

/**
 * useSSE — React hook for Server-Sent Events
 * Uses a single shared connection across the entire application.
 * 
 * @param handlers - Map of event type → callback
 * @param enabled - Set false to disable connection
 */
export function useSSE(handlers: SSEHandlers, enabled: boolean = true): void {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    // Proxy object that always forwards to latest handlersRef
    const proxyHandlers: SSEHandlers = {
      'broadcast:update': (data) => handlersRef.current['broadcast:update']?.(data),
      'broadcast:dismiss': (data) => handlersRef.current['broadcast:dismiss']?.(data),
      'surge:update': (data) => handlersRef.current['surge:update']?.(data),
      'feedback:reply': (data) => handlersRef.current['feedback:reply']?.(data),
      'shop:update': (data) => handlersRef.current['shop:update']?.(data),
      'chat:message': (data) => handlersRef.current['chat:message']?.(data),
    };

    const unsubscribe = sseManager.subscribe(proxyHandlers);
    return unsubscribe;
  }, [enabled]);
}
