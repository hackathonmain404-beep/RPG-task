import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  History,
  PenLine
} from 'lucide-react';
import { feedbackApi } from '../../services/api/feedback';
import { AuthContext } from '../../context/authContextDef';
import { useSSE } from '../../hooks/useSSE';
import type { FeedbackType, Feedback } from '../../types/contract';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

type TabMode = 'create' | 'history';
type FilterFilter = 'ALL' | 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL';

const FEEDBACK_TYPES: Array<{
  type: FeedbackType;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  placeholder: string;
}> = [
  {
    type: 'BUG_REPORT',
    label: 'Bug Report',
    subtitle: 'Something is broken',
    icon: Bug,
    activeColor: '#fb7185',
    activeBg: 'rgba(244, 63, 94, 0.12)',
    activeBorder: '#f43f5e',
    placeholder: 'Describe the bug... What happened? What did you expect?',
  },
  {
    type: 'FEATURE_REQUEST',
    label: 'Feature Request',
    subtitle: 'I have an idea!',
    icon: Lightbulb,
    activeColor: '#38bdf8',
    activeBg: 'rgba(56, 189, 248, 0.12)',
    activeBorder: '#38bdf8',
    placeholder: 'Describe your idea... What problem does it solve? How should it work?',
  },
  {
    type: 'GENERAL',
    label: 'General',
    subtitle: 'Other feedback',
    icon: MessageSquare,
    activeColor: '#c084fc',
    activeBg: 'rgba(168, 85, 247, 0.12)',
    activeBorder: '#a855f7',
    placeholder: 'Share your thoughts, suggestions, or anything else...',
  },
];

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

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  appName = 'Task-Do',
}) => {
  const auth = React.useContext(AuthContext);
  const user = auth?.user;
  const [tab, setTab] = useState<TabMode>('create');
  const [selectedType, setSelectedType] = useState<FeedbackType>('BUG_REPORT');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // History state
  const [historyItems, setHistoryItems] = useState<Feedback[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<FilterFilter>('ALL');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Focus textarea when modal opens in create mode
  useEffect(() => {
    if (isOpen) {
      if (tab === 'create') {
        const timer = setTimeout(() => {
          textareaRef.current?.focus();
        }, 80);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset form states when closed
      setErrorMessage(null);
      setSuccessMessage(null);
      setTab('create');
    }
  }, [isOpen, tab]);

  // Load history when switching to history tab
  useEffect(() => {
    if (isOpen && tab === 'history') {
      loadHistory();
    }
  }, [isOpen, tab]);

  // Escape key handler & focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await feedbackApi.getMyFeedback();
      setHistoryItems(res.feedbacks || []);
    } catch {
      // Silent error fallback for offline/guest
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // SSE: Real-time feedback reply updates from admin
  const sseHandlers = useMemo(() => ({
    'feedback:reply': (data: any) => {
      if (data.feedbackId) {
        setHistoryItems(prev =>
          prev.map(item =>
            item.id === data.feedbackId
              ? {
                  ...item,
                  adminReply: data.adminReply,
                  status: data.status || 'RESOLVED',
                  repliedAt: data.repliedAt,
                }
              : item
          )
        );
      }
    },
  } as const), []);

  useSSE(sseHandlers, isOpen);

  const currentTypeConfig = useMemo(() => {
    return FEEDBACK_TYPES.find(t => t.type === selectedType) || FEEDBACK_TYPES[0];
  }, [selectedType]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await feedbackApi.submit({
        type: selectedType,
        message: trimmed,
      });

      setSuccessMessage('Thank you! Your feedback has been received.');
      setMessage('');
      
      // Update local history
      if (response.feedback) {
        setHistoryItems(prev => [response.feedback, ...prev]);
      }

      // Close modal smoothly after brief delay
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1400);
    } catch (err: any) {
      const errorText =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to submit feedback. Please check your connection and try again.';
      setErrorMessage(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ALL') return historyItems;
    return historyItems.filter(item => item.type === historyFilter);
  }, [historyItems, historyFilter]);

  const counts = useMemo(() => {
    return {
      all: historyItems.length,
      bug: historyItems.filter(h => h.type === 'BUG_REPORT').length,
      feature: historyItems.filter(h => h.type === 'FEATURE_REQUEST').length,
      general: historyItems.filter(h => h.type === 'GENERAL').length,
    };
  }, [historyItems]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'min(92vh, 92dvh)',
          backgroundColor: '#101626',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(124, 58, 237, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'feedbackModalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Violet icon box matching screenshot */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#2b1b44',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquare size={20} color="#c084fc" />
            </div>

            <div>
              <h2
                id="feedback-modal-title"
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  fontFamily: 'var(--font-display, inherit)',
                  letterSpacing: '0.01em',
                }}
              >
                Send Feedback
              </h2>
              <p
                style={{
                  margin: '0.15rem 0 0',
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                }}
              >
                Help us improve {appName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Switch Tab between compose and history */}
            <button
              type="button"
              onClick={() => setTab(t => (t === 'create' ? 'history' : 'create'))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: tab === 'history' ? '#38bdf8' : '#94a3b8',
                backgroundColor: tab === 'history' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                border: tab === 'history' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={tab === 'create' ? 'View past submissions' : 'Compose new feedback'}
            >
              {tab === 'create' ? (
                <>
                  <History size={14} />
                  <span>Submissions</span>
                </>
              ) : (
                <>
                  <PenLine size={14} />
                  <span>Write</span>
                </>
              )}
            </button>

            {/* Close Cross Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Close Feedback Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {tab === 'create' ? (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overflowY: 'auto',
              maxHeight: 'calc(min(92vh, 92dvh) - 75px)',
            }}
          >
            {/* Section 1: Feedback Type Cards */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                WHAT KIND OF FEEDBACK?
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
                  gap: '0.75rem',
                }}
                role="radiogroup"
                aria-label="Feedback Type"
              >
                {FEEDBACK_TYPES.map(item => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.type;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setSelectedType(item.type);
                        setErrorMessage(null);
                      }}
                      style={{
                        padding: '0.85rem 0.5rem',
                        borderRadius: '12px',
                        border: isSelected
                          ? `1px solid ${item.activeBorder}`
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        backgroundColor: isSelected ? item.activeBg : '#141c2e',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected
                          ? `0 0 14px ${item.activeBg}`
                          : 'none',
                      }}
                    >
                      <Icon
                        size={20}
                        color={isSelected ? item.activeColor : '#94a3b8'}
                      />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: isSelected ? item.activeColor : '#cbd5e1',
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: isSelected
                            ? 'rgba(255, 255, 255, 0.8)'
                            : '#64748b',
                        }}
                      >
                        {item.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Message Textarea */}
            <div>
              <label
                htmlFor="feedback-message-textarea"
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem',
                }}
              >
                YOUR MESSAGE
              </label>

              <div style={{ position: 'relative' }}>
                <textarea
                  id="feedback-message-textarea"
                  ref={textareaRef}
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={currentTypeConfig.placeholder}
                  disabled={isSubmitting}
                  maxLength={2000}
                  rows={4}
                  style={{
                    width: '100%',
                    minHeight: '125px',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#0c1322',
                    color: '#f8fafc',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(168, 85, 247, 0.15)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Dynamic live character counter */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '0.35rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: message.length >= 1900 ? '#f43f5e' : '#64748b',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {message.length} chars
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fda4af',
                  fontSize: '0.82rem',
                }}
              >
                <AlertCircle size={16} color="#fb7185" style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#6ee7b7',
                  fontSize: '0.82rem',
                }}
              >
                <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isSubmitting) e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                  if (!isSubmitting) e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={message.trim().length === 0 || isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '9px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6d28d9, #5b21b6)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: message.trim().length === 0 || isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: message.trim().length === 0 || isSubmitting ? 0.5 : 1,
                  boxShadow: message.trim().length > 0 && !isSubmitting ? '0 4px 14px rgba(109, 40, 217, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  minHeight: '40px',
                }}
                onMouseEnter={e => {
                  if (message.trim().length > 0 && !isSubmitting) {
                    e.currentTarget.style.filter = 'brightness(1.15)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* History Tab View (matching screenshot 2) */
          <div
            style={{
              padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              maxHeight: 'calc(min(92vh, 92dvh) - 75px)',
              overflowY: 'auto',
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'ALL' as FilterFilter, label: `All (${counts.all})` },
                { key: 'BUG_REPORT' as FilterFilter, label: `Bug (${counts.bug})` },
                { key: 'FEATURE_REQUEST' as FilterFilter, label: `Feature (${counts.feature})` },
                { key: 'GENERAL' as FilterFilter, label: `General (${counts.general})` },
              ].map(f => {
                const isActive = historyFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setHistoryFilter(f.key)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isActive ? '#6d28d9' : 'rgba(255, 255, 255, 0.04)',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* List */}
            {isLoadingHistory ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem', color: '#94a3b8' }}>
                <Loader2 size={20} className="spin-animation" />
                <span style={{ fontSize: '0.85rem' }}>Loading submissions...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <MessageSquare size={32} color="#475569" />
                <p style={{ margin: 0 }}>No submissions found in this category.</p>
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#c084fc',
                    cursor: 'pointer',
                  }}
                >
                  Write your first feedback
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredHistory.map(item => {
                  const isBug = item.type === 'BUG_REPORT';
                  const isFeature = item.type === 'FEATURE_REQUEST';
                  const badgeColor = isBug ? '#f43f5e' : isFeature ? '#f59e0b' : '#a855f7';
                  const badgeBg = isBug ? 'rgba(244, 63, 94, 0.15)' : isFeature ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)';
                  const label = isBug ? '🐞 Bug' : isFeature ? '💡 Feature' : '💬 General';

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        backgroundColor: '#141c2e',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: badgeColor,
                              backgroundColor: badgeBg,
                              border: `1px solid ${badgeColor}33`,
                            }}
                          >
                            {label}
                          </span>

                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: (item.status === 'REVIEWED' || item.status === 'RESOLVED') ? '#34d399' : '#f59e0b',
                              backgroundColor: (item.status === 'REVIEWED' || item.status === 'RESOLVED') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {item.status === 'REVIEWED' ? 'REVIEWED BY ADMIN' : item.status}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: '#e2e8f0',
                          lineHeight: '1.45',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.message}
                      </p>

                      {/* Admin Reply Block */}
                      {item.adminReply && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem 0.85rem',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#34d399',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}>
                              🛡️ Admin Reply
                            </span>
                            {item.repliedAt && (
                              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                • {formatRelativeTime(item.repliedAt)}
                              </span>
                            )}
                          </div>
                          <p style={{
                            margin: 0,
                            fontSize: '0.82rem',
                            color: '#a7f3d0',
                            lineHeight: '1.45',
                            wordBreak: 'break-word',
                          }}>
                            {item.adminReply}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '0.35rem',
                          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <span>
                          From: <strong style={{ color: '#94a3b8' }}>{user?.displayName || 'Adventurer'}</strong> ({user?.email || 'guest@liferpg.local'})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
