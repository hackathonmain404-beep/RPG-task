import { useEffect, useRef, useCallback } from 'react';

/**
 * Event types emitted by the SSE server
 */
export type SSEEventType =
  | 'broadcast:update'
  | 'broadcast:dismiss'
  | 'surge:update'
  | 'feedback:reply'
  | 'shop:update';

export type SSEHandlers = Partial<Record<SSEEventType, (data: any) => void>>;

/**
 * useSSE — React hook for Server-Sent Events
 * 
 * Connects to the backend SSE stream and routes events to handlers.
 * Auto-reconnects on disconnect (built into EventSource).
 * 
 * @param handlers - Map of event type → callback
 * @param enabled - Set false to disable the connection
 */
export function useSSE(handlers: SSEHandlers, enabled: boolean = true): void {
  const handlersRef = useRef(handlers);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Keep handlers ref up to date without re-creating EventSource
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Build SSE URL with optional auth token
    const baseUrl = import.meta.env.VITE_API_URL || '/api';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const token = localStorage.getItem('auth_token');
    const sseUrl = token
      ? `${cleanBase}/sse/stream?token=${encodeURIComponent(token)}`
      : `${cleanBase}/sse/stream`;

    if (typeof EventSource === 'undefined') {
      return;
    }

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    // Register listeners for each event type
    const eventTypes: SSEEventType[] = [
      'broadcast:update',
      'broadcast:dismiss',
      'surge:update',
      'feedback:reply',
      'shop:update',
    ];

    eventTypes.forEach((eventType) => {
      es.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handlersRef.current[eventType]?.(data);
        } catch (err) {
          console.warn(`[SSE] Failed to parse "${eventType}" event:`, err);
        }
      });
    });

    es.addEventListener('connected', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Connected to real-time stream:', data.clientId);
      } catch {
        // Ignore
      }
    });

    es.onerror = () => {
      // EventSource auto-reconnects on error
      // No action needed — just log for debugging
      console.log('[SSE] Connection error — will auto-reconnect...');
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, connect]);
}
