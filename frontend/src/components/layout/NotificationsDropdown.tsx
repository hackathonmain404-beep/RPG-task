import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import type { NotificationItem } from '../../context/NotificationContext';
import { useFeedback } from '../../context/FeedbackContext';
import {
  Bell,
  CheckCheck,
  X,
  Bug,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Check,
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const NotificationsDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    hasUnread,
    isDropdownOpen,
    setIsDropdownOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { openFeedback } = useFeedback();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  const handleOpenFeedback = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsDropdownOpen(false);
    navigate('/feedback');
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'BUG_REPORT':
        return {
          icon: Bug,
          label: 'Bug Report',
          color: '#fb7185',
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
        };
      case 'FEATURE_REQUEST':
        return {
          icon: Lightbulb,
          label: 'Feature Idea',
          color: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.12)',
          border: 'rgba(251, 191, 36, 0.3)',
        };
      case 'GENERAL':
      default:
        return {
          icon: MessageSquare,
          label: 'Feedback',
          color: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.3)',
        };
    }
  };

  return (
    <div ref={dropdownRef} className="hud-notification-container" style={{ position: 'relative' }}>
      {/* 1. Bell Trigger Button */}
      <button
        type="button"
        id="hud-notifications-trigger"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className={`rpg-btn hud-notification-btn ${isDropdownOpen ? 'is-active' : ''}`}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-haspopup="dialog"
        aria-expanded={isDropdownOpen}
        title={unreadCount > 0 ? `${unreadCount} unread council replies` : 'Citadel Notifications'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '38px',
          height: '38px',
          padding: 0,
          borderRadius: '10px',
          backgroundColor: isDropdownOpen
            ? 'rgba(168, 85, 247, 0.22)'
            : hasUnread
            ? 'rgba(239, 68, 68, 0.12)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isDropdownOpen
            ? '1px solid rgba(168, 85, 247, 0.5)'
            : hasUnread
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : '1px solid var(--border-subtle)',
          color: isDropdownOpen ? '#c084fc' : hasUnread ? '#f87171' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell size={18} />

        {/* Pulsing indicator & badge */}
        {hasUnread && (
          <>
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)',
                zIndex: 2,
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                opacity: 0.65,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                zIndex: 1,
              }}
            />
          </>
        )}
      </button>

      {/* 2. Glassmorphic Notifications Popover */}
      {isDropdownOpen && (
        <div
          role="dialog"
          aria-label="Transmissions and Notifications"
          className="hud-notifications-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 'clamp(320px, 85vw, 420px)',
            maxHeight: 'min(580px, 80vh)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(15, 20, 28, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65), 0 0 25px rgba(168, 85, 247, 0.2)',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'fadeInSlideDown 0.18s ease-out forwards',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.9rem 1.15rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.12), transparent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="#c084fc" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', letterSpacing: '0.04em' }}>
                CITADEL TRANSMISSIONS
              </span>
              {hasUnread && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                  }}
                >
                  {unreadCount} NEW
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {hasUnread && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(false)}
                aria-label="Close Notifications"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List Area */}
          <div
            style={{
              padding: '0.75rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              flex: 1,
            }}
          >
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={22} color="#a855f7" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#f8fafc', fontWeight: 700 }}>
                    No Active Transmissions
                  </h4>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                    When the Citadel council replies to your bugs, feature suggestions, or feedback, they will appear here instantly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openFeedback();
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(168, 85, 247, 0.18)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#e9d5ff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Transmit New Feedback
                </button>
              </div>
            ) : (
              notifications.map((item) => {
                const style = getTypeStyle(item.type);
                const Icon = style.icon;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '12px',
                      backgroundColor: item.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(168, 85, 247, 0.08)',
                      border: item.read
                        ? '1px solid rgba(255, 255, 255, 0.07)'
                        : '1px solid rgba(168, 85, 247, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      position: 'relative',
                      transition: 'all 0.18s ease',
                      boxShadow: item.read ? 'none' : '0 0 14px rgba(168, 85, 247, 0.15)',
                    }}
                  >
                    {/* Unread Glow Dot */}
                    {!item.read && (
                      <span
                        title="Unread transmission"
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#c084fc',
                          boxShadow: '0 0 8px #c084fc',
                        }}
                      />
                    )}

                    {/* Top Row: Badge & Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingRight: item.read ? '0' : '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: style.color,
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                          }}
                        >
                          <Icon size={12} />
                          <span>{style.label}</span>
                        </span>

                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '5px',
                            color: '#34d399',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.status === 'REVIEWED' ? 'REVIEWED' : item.status}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {formatRelativeTime(item.repliedAt)}
                      </span>
                    </div>

                    {/* User's original prompt excerpt */}
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#94a3b8',
                        lineHeight: 1.4,
                        padding: '0.35rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        borderLeft: '2px solid rgba(255, 255, 255, 0.15)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Your Query: </span>
                      &ldquo;{item.originalMessage}&rdquo;
                    </div>

                    {/* Council / Admin Reply Box */}
                    <div
                      style={{
                        padding: '0.65rem 0.8rem',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.09)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          🛡️ Council Reply
                        </span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.82rem',
                          color: '#d1fae5',
                          lineHeight: 1.45,
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.adminReply}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.35rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.72rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenFeedback(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'none',
                          border: 'none',
                          color: '#c084fc',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        <span>View in Feedback</span>
                        <ArrowRight size={12} />
                      </button>

                      {!item.read ? (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                        >
                          <Check size={12} />
                          <span>Mark read</span>
                        </button>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '0.68rem' }}>Read</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: '0.65rem 1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              fontSize: '0.74rem',
            }}
          >
            <span style={{ color: '#64748b' }}>
              Real-time Council Link Active
            </span>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                navigate('/feedback');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>Feedback Center</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
