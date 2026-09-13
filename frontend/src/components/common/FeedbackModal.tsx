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
  PenLine,
  Check
} from 'lucide-react';
import { feedbackApi } from '../../services/api/feedback';
import { AuthContext } from '../../context/authContextDef';
import { useSSE } from '../../hooks/useSSE';
import type { FeedbackType, Feedback } from '../../types/contract';
import './feedback-modal.css';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
}

type TabMode = 'create' | 'history';
type FilterFilter = 'ALL' | 'BUG_REPORT' | 'FEATURE_REQUEST' | 'GENERAL';

interface FeedbackTypeConfig {
  type: FeedbackType;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  accentColor: string;
  activeBg: string;
  activeBorder: string;
  glowColor: string;
  placeholder: string;
}

const FEEDBACK_TYPES: FeedbackTypeConfig[] = [
  {
    type: 'BUG_REPORT',
    label: 'Bug Report',
    subtitle: 'Something is broken',
    icon: Bug,
    accentColor: '#fb7185',
    activeBg: 'rgba(244, 63, 94, 0.14)',
    activeBorder: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    placeholder: 'Describe the bug... What happened? What did you expect?',
  },
  {
    type: 'FEATURE_REQUEST',
    label: 'Feature Request',
    subtitle: 'I have an idea!',
    icon: Lightbulb,
    accentColor: '#38bdf8',
    activeBg: 'rgba(56, 189, 248, 0.14)',
    activeBorder: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    placeholder: 'Describe your idea... What problem does it solve? How should it work?',
  },
  {
    type: 'GENERAL',
    label: 'General',
    subtitle: 'Other feedback',
    icon: MessageSquare,
    accentColor: '#c084fc',
    activeBg: 'rgba(168, 85, 247, 0.14)',
    activeBorder: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.25)',
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
  const modalWrapperRef = useRef<HTMLDivElement | null>(null);

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

  // Load history when switching to history tab
  useEffect(() => {
    if (isOpen && tab === 'history') {
      void loadHistory();
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
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!modalWrapperRef.current) return;
    const rect = modalWrapperRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    modalWrapperRef.current.style.setProperty('--mouse-x', `${x}%`);
    modalWrapperRef.current.style.setProperty('--mouse-y', `${y}%`);
  };

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
      className="feedback-overlay-backdrop"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={modalWrapperRef}
        className="feedback-modal-wrapper"
        onMouseMove={handleMouseMove}
      >
        {/* Ambient background depth glow */}
        <div className="feedback-ambient-glow" aria-hidden="true" />

        {/* Modal Shell Card */}
        <div className="feedback-modal-card">
          {/* Header */}
          <header className="feedback-header">
            <div className="feedback-header-left">
              <div className="feedback-icon-chamber">
                <MessageSquare size={20} color="#c084fc" />
              </div>

              <div>
                <h2 id="feedback-modal-title" className="feedback-title-text">
                  Send Feedback
                </h2>
                <p className="feedback-subtitle-text">
                  Help us improve {appName}
                </p>
              </div>
            </div>

            <div className="feedback-header-actions">
              {/* Switch Tab between compose and history */}
              <button
                type="button"
                onClick={() => setTab(t => (t === 'create' ? 'history' : 'create'))}
                className={`feedback-tab-toggle ${tab === 'history' ? 'active-history' : 'idle-history'}`}
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

              {/* Close Button with 45deg Hover Rotation */}
              <button
                type="button"
                onClick={onClose}
                className="feedback-close-btn"
                aria-label="Close Feedback Modal"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          {/* Modal Body */}
          {tab === 'create' ? (
            <form onSubmit={handleSubmit} className="feedback-body-form">
              {/* Section 1: Feedback Type Tiles */}
              <div>
                <label className="feedback-section-label">
                  WHAT KIND OF FEEDBACK?
                </label>

                <div
                  className="feedback-tiles-grid"
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
                        className={`feedback-tile ${isSelected ? 'selected' : ''}`}
                        style={{
                          backgroundColor: isSelected ? item.activeBg : undefined,
                          borderColor: isSelected ? item.activeBorder : undefined,
                          boxShadow: isSelected ? `0 0 16px ${item.glowColor}` : undefined,
                        }}
                      >
                        <div 
                          className="feedback-tile-icon-wrap"
                          style={{
                            backgroundColor: isSelected ? item.glowColor : 'rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <Icon
                            size={18}
                            color={isSelected ? item.accentColor : '#94a3b8'}
                          />
                        </div>

                        <span
                          className="feedback-tile-title"
                          style={{
                            color: isSelected ? item.accentColor : '#cbd5e1',
                          }}
                        >
                          {item.label}
                        </span>

                        <span
                          className="feedback-tile-desc"
                          style={{
                            color: isSelected ? '#f1f5f9' : '#64748b',
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
                  className="feedback-section-label"
                >
                  YOUR MESSAGE
                </label>

                <div className="feedback-textarea-container">
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
                    className="feedback-textarea-input"
                  />
                </div>

                {/* Character counter */}
                <div className="feedback-counter-row">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary, #64748b)' }}>
                    Detailed notes help our engineering team resolve items faster.
                  </span>
                  <span
                    className={`feedback-counter-text ${message.length >= 1900 ? 'near-limit' : ''}`}
                  >
                    {message.length} chars
                  </span>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="feedback-banner error" role="alert">
                  <AlertCircle size={16} color="#fb7185" style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="feedback-banner success" role="status">
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}
>>>>>>> 8972449 (feat(ui): redesign settings command center and feedback popup into interactive HUDs)

              {/* Actions Footer */}
              <div className="feedback-footer">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="feedback-cancel-btn"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={message.trim().length === 0 || isSubmitting}
                  className="feedback-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : successMessage ? (
                    <>
                      <Check size={16} color="#34d399" />
                      <span>Sent!</span>
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
            /* History Tab View */
            <div className="feedback-history-pane">
              {/* Filter Pills */}
              <div className="feedback-filter-pills">
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
                      className={`feedback-pill-btn ${isActive ? 'active' : 'idle'}`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {/* List */}
              {isLoadingHistory ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0', gap: '0.65rem', color: '#94a3b8' }}>
                  <Loader2 size={20} className="animate-spin" color="#38bdf8" />
                  <span style={{ fontSize: '0.86rem' }}>Loading submissions...</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2.5rem 1rem',
                    color: '#64748b',
                    fontSize: '0.86rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.85rem',
                  }}
                >
                  <MessageSquare size={36} color="#475569" />
                  <p style={{ margin: 0 }}>No submissions found in this category.</p>
                  <button
                    type="button"
                    onClick={() => setTab('create')}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.35)',
                      color: '#c084fc',
                      cursor: 'pointer',
                    }}
                  >
                    Write your first feedback
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {filteredHistory.map(item => {
                    const isBug = item.type === 'BUG_REPORT';
                    const isFeature = item.type === 'FEATURE_REQUEST';
                    const badgeColor = isBug ? '#f43f5e' : isFeature ? '#f59e0b' : '#a855f7';
                    const badgeBg = isBug ? 'rgba(244, 63, 94, 0.15)' : isFeature ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)';
                    const label = isBug ? '🐞 Bug' : isFeature ? '💡 Feature' : '💬 General';

                    return (
                      <div key={item.id} className="feedback-history-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
                                padding: '0.2rem 0.55rem',
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
                            fontSize: '0.86rem',
                            color: '#e2e8f0',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.message}
                        </p>

                        {/* Admin Reply Block */}
                        {item.adminReply && (
                          <div
                            style={{
                              marginTop: '0.4rem',
                              padding: '0.75rem 0.95rem',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
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
                            paddingTop: '0.45rem',
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
    </div>
  );
};
