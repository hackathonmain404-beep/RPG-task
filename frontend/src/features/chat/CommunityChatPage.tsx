import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { RefreshCw, Send, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
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

  // Load messages
  const fetchMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    setError(null);
    try {
      const data = await getCommunityChatMessages(200);
      setMessages(data.messages);
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
      setTimeout(() => scrollToBottom(true), 50);
    }
  }, [messages, scrollToBottom]);

  // Handle SSE live messages
  const sseHandlers = useMemo(() => ({
    'chat:message': (data: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    },
  }), []);

  useSSE(sseHandlers, true);

  // Manual refresh
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

  // Send message
  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed.length > MAX_CHARS || isSending) return;

    setIsSending(true);
    try {
      const newMsg = await sendCommunityChatMessage(trimmed);
      // Optimistic: add immediately (SSE will also deliver but dedup protects)
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err: unknown) {
      // Show error briefly but don't break the chat
      console.error('[Chat] Failed to send:', err);
    } finally {
      setIsSending(false);
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
            const isOwn = msg.userId === user?.id;
            const isAdmin = msg.user.role === 'ADMIN';
            const avatarColor = getAvatarColor(msg.user.displayName);

            return (
              <div
                key={msg.id}
                className={`chat-message-row ${isOwn ? 'is-own' : ''}`}
              >
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
                <div className="chat-msg-body">
                  <div className="chat-msg-header">
                    <span className={`chat-msg-name ${isAdmin ? 'is-admin' : ''}`}>
                      {msg.user.displayName}
                    </span>
                    <span className="chat-msg-level">Lv. {msg.user.level}</span>
                    {isAdmin && (
                      <span className="chat-msg-admin-badge">🛡️ Admin</span>
                    )}
                    <span className="chat-msg-time">{formatTime(msg.createdAt)}</span>
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
            disabled={isSending}
            aria-label="Chat message input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!inputValue.trim() || charCount > MAX_CHARS || isSending}
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
