import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RefreshCw, Send, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useShop } from '../../context/useShop';
import { useSSE } from '../../hooks/useSSE';
import { getCommunityChatMessages, sendCommunityChatMessage } from '../../services/api/chat';
import type { ChatMessage } from '../../types/contract';
import './community-chat.css';

const MAX_CHARS = 500;

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function getDateLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - msgDay.getTime();
  const dayMs = 86400000;

  if (diff === 0) return 'Today';
  if (diff === dayMs) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function getAvatarColor(name: string): string {
  const colors = ['#3b82f6', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const CommunityChatPage: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useShop();

  // Active badge: user.badge from backend or any owned badge from shop inventory
  const ownedBadgeItem = inventory?.find(
    (i) =>
      i.shopItem?.itemType === 'BADGE' ||
      (i.itemId || i.shopItemId)?.startsWith('badge_')
  );
  const activeBadge =
    user?.badge ||
    (ownedBadgeItem
      ? {
          id: ownedBadgeItem.id,
          name: ownedBadgeItem.shopItem?.name || 'Shadow Badge',
          icon: '/assets/items/badge_shadow.svg',
          sku: ownedBadgeItem.shopItem?.sku || 'badge_shadow',
        }
      : null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollFab, setShowScrollFab] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  // Detect if user is near bottom
  const handleScroll = useCallback(() => {
    const area = messagesAreaRef.current;
    if (!area) return;
    const threshold = 80;
    const isNearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < threshold;
    isAtBottomRef.current = isNearBottom;
    setShowScrollFab(!isNearBottom);
  }, []);

  // Load messages (with optional initial spinner)
  const fetchMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    setError(null);
    try {
      const data = await getCommunityChatMessages(200);
      setMessages((prev) => {
        // Retain any pending optimistic messages that are currently in-flight
        const pendingTemps = prev.filter((m) => m.id.startsWith('temp-'));
        const merged = [...data.messages];
        for (const temp of pendingTemps) {
          if (!merged.some((m) => m.userId === temp.userId && m.content === temp.content)) {
            merged.push(temp);
          }
        }
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return merged;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMessages(true);
  }, [fetchMessages]);

  // Auto-scroll on new messages if user is at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      setTimeout(() => scrollToBottom(true), 40);
    }
  }, [messages, scrollToBottom]);

  // 1. Real-time Live SSE Stream (<50ms latency)
  const sseHandlers = useMemo(() => ({
    'chat:message': (data: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate IDs
        if (prev.some((m) => m.id === data.id)) return prev;

        // If this matches an in-flight optimistic message from the sender, upgrade it
        const tempIdx = prev.findIndex(
          (m) =>
            m.id.startsWith('temp-') &&
            m.userId === data.userId &&
            m.content === data.content
        );

        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = { ...data, status: 'sent' };
          return next;
        }

        return [...prev, { ...data, status: 'sent' }];
      });
    },
  }), []);

  useSSE(sseHandlers, true);

  // 2. Silent Auto-Sync Fallback (Every 2.5s — Zero Blinking, Zero UI Disruption)
  useEffect(() => {
    const silentSyncInterval = setInterval(async () => {
      try {
        const data = await getCommunityChatMessages(200);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const hasNew = data.messages.some((m) => !existingIds.has(m.id));

          // If no new messages, return EXACT same reference to avoid ANY re-render or blink
          if (!hasNew) {
            return prev;
          }

          // Smoothly merge server messages with any pending local messages
          const pendingTemps = prev.filter((m) => m.id.startsWith('temp-'));
          const merged = [...data.messages];
          for (const temp of pendingTemps) {
            if (!merged.some((m) => m.userId === temp.userId && m.content === temp.content)) {
              merged.push(temp);
            }
          }
          merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          return merged;
        });
      } catch {
        // Silent background check failure — do not disturb the user
      }
    }, 2500);

    return () => clearInterval(silentSyncInterval);
  }, []);

  // Manual refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages(false);
    setIsRefreshing(false);
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  };

  // 3. Instant 0ms Optimistic Message Sending
  const handleSend = async (retryContent?: string, failedId?: string) => {
    const textToSend = (retryContent !== undefined ? retryContent : inputValue).trim();
    if (!textToSend || textToSend.length > MAX_CHARS) return;

    const tempId = failedId || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const optimisticMsg: ChatMessage = {
      id: tempId,
      userId: user?.id || 'me',
      content: textToSend,
      createdAt: new Date().toISOString(),
      status: 'sending',
      user: {
        id: user?.id || 'me',
        displayName: user?.displayName || 'Adventurer',
        avatarUrl: user?.avatarUrl,
        role: user?.role,
        level: (user as any)?.character?.level ?? 1,
        badge: activeBadge,
      },
    };

    if (failedId) {
      // Retry mode: switch state to sending
      setMessages((prev) =>
        prev.map((m) => (m.id === failedId ? optimisticMsg : m))
      );
    } else {
      // New send: 0ms INSTANT visual feedback
      setMessages((prev) => [...prev, optimisticMsg]);
      // 0ms INSTANT input reset
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }

    // Scroll to bottom immediately
    setTimeout(() => scrollToBottom(true), 20);

    // Send to backend in background
    try {
      const realMsg = await sendCommunityChatMessage(textToSend);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...realMsg, status: 'sent' } : m))
      );
    } catch (err: unknown) {
      console.error('[Chat] Failed to send message:', err);
      // Mark the message as failed so user can click to retry
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
    }
  };

  // Keyboard: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date for separators
  const messagesWithDates = useMemo(() => {
    const result: Array<{ type: 'date'; label: string } | { type: 'msg'; msg: ChatMessage }> = [];
    let lastDate = '';
    for (const msg of messages) {
      const dateLabel = getDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        result.push({ type: 'date', label: dateLabel });
        lastDate = dateLabel;
      }
      result.push({ type: 'msg', msg });
    }
    return result;
  }, [messages]);

  const charCount = inputValue.length;

  return (
    <div className="community-chat-page">
      {/* ── Header ── */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-header-icon">💬</span>
          <span className="chat-header-title">Community Chat</span>
          <span className="chat-live-badge">
            <span className="chat-live-dot" />
            LIVE
          </span>
        </div>
        <div className="chat-header-right">
          <span className="chat-retention-badge">
            ⏳ 3-Day Ephemeral
          </span>
          <button
            className={`chat-refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh messages"
            aria-label="Refresh messages"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      {isLoading ? (
        <div className="chat-loading-state">
          <div className="chat-loading-spinner" />
          <span className="chat-loading-text">Loading tavern messages…</span>
        </div>
      ) : error ? (
        <div className="chat-error-state">
          <span className="chat-error-icon">⚠️</span>
          <span className="chat-error-text">{error}</span>
          <button className="chat-retry-btn" onClick={() => fetchMessages(true)}>
            Try Again
          </button>
        </div>
      ) : messages.length === 0 ? (
        <div className="chat-empty-state">
          <span className="chat-empty-icon">🏰</span>
          <span className="chat-empty-title">The tavern is quiet…</span>
          <span className="chat-empty-subtitle">
            Be the first adventurer to break the silence! Messages stay for 3 days.
          </span>
        </div>
      ) : (
        <div
          className="chat-messages-area"
          ref={messagesAreaRef}
          onScroll={handleScroll}
        >
          {messagesWithDates.map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${idx}`} className="chat-date-separator">
                  <span className="chat-date-line" />
                  <span className="chat-date-label">{item.label}</span>
                  <span className="chat-date-line" />
                </div>
              );
            }

            const msg = item.msg;
            const isOwn = msg.userId === user?.id || msg.id.startsWith('temp-');
            const isAdmin = msg.user.role === 'ADMIN';
            const avatarColor = getAvatarColor(msg.user.displayName);
            const msgBadge = msg.user.badge || (isOwn ? activeBadge : null);

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isOwn ? 'is-own' : ''}`}
              >
                <div className="chat-avatar-wrapper" style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    className="chat-msg-avatar"
                    style={{
                      background: msg.user.avatarUrl
                        ? 'transparent'
                        : `linear-gradient(135deg, ${avatarColor}, ${avatarColor}88)`,
                    }}
                  >
                    {msg.user.avatarUrl ? (
                      <img
                        src={msg.user.avatarUrl}
                        alt={msg.user.displayName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      msg.user.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  {msgBadge && (
                    <div
                      className="chat-msg-pfp-badge"
                      title={`${msgBadge.name} (Badge)`}
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-3px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#0c111e',
                        border: '1.5px solid #a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(168, 85, 247, 0.7)',
                        zIndex: 2,
                      }}
                    >
                      <img
                        src={msgBadge.icon || '/assets/items/badge_shadow.svg'}
                        alt={msgBadge.name}
                        style={{ width: '12px', height: '12px', objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
                <div className="chat-msg-body">
                  <div className="chat-msg-header">
                    <span className={`chat-msg-name ${isAdmin ? 'is-admin' : ''}`}>
                      {msg.user.displayName}
                    </span>
                    {msgBadge && (
                      <span
                        className="chat-msg-badge-tag"
                        title={`${msgBadge.name} (Badge)`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '1px 6px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          border: '1px solid rgba(168, 85, 247, 0.35)',
                          borderRadius: '8px',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: '#e9d5ff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        <img
                          src={msgBadge.icon || '/assets/items/badge_shadow.svg'}
                          alt={msgBadge.name}
                          style={{ width: '11px', height: '11px', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span>{msgBadge.name}</span>
                      </span>
                    )}
                    <span className="chat-msg-level">Lv. {msg.user.level}</span>
                    {isAdmin && (
                      <span className="chat-msg-admin-badge">🛡️ Admin</span>
                    )}
                    <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>

                    {/* Own Message Status Indicator */}
                    {isOwn && (
                      <span className={`chat-msg-status ${msg.status || 'sent'}`}>
                        {msg.status === 'sending' && (
                          <>
                            <span className="chat-sending-dot" />
                            <span>sending</span>
                          </>
                        )}
                        {msg.status === 'failed' && (
                          <span
                            className="chat-msg-status failed"
                            onClick={() => handleSend(msg.content, msg.id)}
                            title="Failed to send. Click to retry."
                          >
                            ⚠️ Retry
                          </span>
                        )}
                        {(!msg.status || msg.status === 'sent') && (
                          <span title="Delivered">✓</span>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="chat-msg-text">{msg.content}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ── Scroll to bottom FAB ── */}
      <button
        className={`chat-scroll-fab ${showScrollFab ? 'is-visible' : ''}`}
        onClick={() => scrollToBottom(true)}
        aria-label="Scroll to latest"
      >
        <ArrowDown size={18} />
      </button>

      {/* ── Input Area ── */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-text-input"
            placeholder="Send a message to the tavern…"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_CHARS + 10}
            aria-label="Chat message input"
          />
          <button
            className="chat-send-btn"
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || charCount > MAX_CHARS}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="chat-input-footer">
          <span className="chat-input-hint">
            Enter to send · Shift+Enter for new line
          </span>
          <span
            className={`chat-char-count ${
              charCount > MAX_CHARS
                ? 'is-over-limit'
                : charCount > MAX_CHARS * 0.85
                  ? 'is-near-limit'
                  : ''
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommunityChatPage;
