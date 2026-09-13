import React, { useState, useEffect, useMemo } from 'react';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { feedbackApi } from '../../services/api/feedback';
import { useSSE } from '../../hooks/useSSE';
import type { FeedbackType, Feedback } from '../../types/contract';
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  History,
  PenLine
} from 'lucide-react';

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
    label: 'Report Bug',
    subtitle: 'Something is broken, sluggish, or misbehaving',
    icon: Bug,
    activeColor: '#ef4444',
    activeBg: 'rgba(239, 68, 68, 0.12)',
    activeBorder: 'rgba(239, 68, 68, 0.45)',
    placeholder: 'Describe the bug... What happened? What did you expect?',
  },
  {
    type: 'FEATURE_REQUEST',
    label: 'Idea / Feature',
    subtitle: 'Suggest improvements, new mechanics, or armory items',
    icon: Lightbulb,
    activeColor: '#f59e0b',
    activeBg: 'rgba(245, 158, 11, 0.12)',
    activeBorder: 'rgba(245, 158, 11, 0.45)',
    placeholder: 'Describe your idea... What problem does it solve? How should it work?',
  },
  {
    type: 'GENERAL',
    label: 'Feedback',
    subtitle: 'Share your overall thoughts and experience',
    icon: MessageSquare,
    activeColor: '#38bdf8',
    activeBg: 'rgba(56, 189, 248, 0.12)',
    activeBorder: 'rgba(56, 189, 248, 0.45)',
    placeholder: 'Share your thoughts, suggestions, or anything else...',
  },
];

export const FeedbackPage: React.FC = () => {
  useDocumentMetadata('Feedback & Insights', { noindex: true });

  const [tab, setTab] = useState<TabMode>('create');
  const [selectedType, setSelectedType] = useState<FeedbackType>('BUG_REPORT');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [historyItems, setHistoryItems] = useState<Feedback[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<FilterFilter>('ALL');

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await feedbackApi.getMyFeedback();
      setHistoryItems(res.feedbacks || []);
    } catch {
      // Ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (tab === 'history') {
      void loadHistory();
    }
  }, [tab]);

  // Real-time SSE updates for admin status changes
  const sseHandlers = useMemo(
    () => ({
      'feedback:reply': (data: any) => {
        const targetId = data?.feedbackId || data?.feedback?.id;
        const adminReply = data?.adminReply || data?.feedback?.adminReply;
        const status = data?.status || data?.feedback?.status || 'REVIEWED';
        const repliedAt = data?.repliedAt || data?.feedback?.repliedAt || new Date().toISOString();

        if (targetId) {
          setHistoryItems((prev) =>
            prev.map((item) =>
              item.id === targetId
                ? {
                    ...item,
                    ...(data?.feedback || {}),
                    adminReply: adminReply || item.adminReply,
                    status: status || item.status,
                    repliedAt: repliedAt || item.repliedAt,
                  }
                : item
            )
          );
        }
      },
    }),
    []
  );

  useSSE(sseHandlers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = message.trim();
    if (!clean) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await feedbackApi.submit({
        type: selectedType,
        message: clean,
      });

      setSuccessMessage('Thank you! Your feedback has been received.');
      setMessage('');
      if (res.feedback) {
        setHistoryItems(prev => [res.feedback, ...prev]);
      }

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ALL') return historyItems;
    return historyItems.filter(item => item.type === historyFilter);
  }, [historyItems, historyFilter]);

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header Banner */}
      <header
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          flexWrap: 'wrap',
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          borderRadius: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '2px solid rgba(168, 85, 247, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.25)',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={26} color="#c084fc" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', fontWeight: 800, margin: 0 }}>
              Feedback &amp; Suggestions
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
              Report anomalies, suggest enhancements, or share observations directly with the Citadel council.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`rpg-button ${tab === 'create' ? 'primary' : 'secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <PenLine size={15} />
            <span>Compose</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`rpg-button ${tab === 'history' ? 'primary' : 'secondary'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <History size={15} />
            <span>History ({historyItems.length})</span>
          </button>
        </div>
      </header>

      {/* 2. Compose Mode */}
      {tab === 'create' && (
        <form onSubmit={handleSubmit} className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.06em' }}>
              SELECT FEEDBACK CATEGORY
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }} role="radiogroup">
              {FEEDBACK_TYPES.map(item => {
                const Icon = item.icon;
                const isSelected = selectedType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedType(item.type)}
                    style={{
                      padding: '1rem 0.75rem',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${item.activeBorder}` : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? item.activeBg : 'var(--bg-surface-sunken)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? `0 0 16px ${item.activeBg}` : 'none',
                    }}
                  >
                    <Icon size={22} color={isSelected ? item.activeColor : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? item.activeColor : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                      {item.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-page-message" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
              YOUR TRANSMISSION
            </label>
            <textarea
              id="feedback-page-message"
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 2000))}
              placeholder={FEEDBACK_TYPES.find(t => t.type === selectedType)?.placeholder}
              rows={5}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {message.length} / 2000 characters
            </div>
          </div>

          {errorMessage && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', fontSize: '0.85rem' }}>
              <AlertCircle size={16} color="#fb7185" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div role="status" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="submit"
              disabled={message.trim().length === 0 || isSubmitting}
              className="rpg-button primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', minHeight: '44px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Transmitting...</span>
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
      )}

      {/* 3. History Mode */}
      {tab === 'history' && (
        <div className="rpg-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['ALL', 'BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL'] as FilterFilter[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setHistoryFilter(key)}
                className="rpg-button secondary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  backgroundColor: historyFilter === key ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderColor: historyFilter === key ? 'var(--border-focus)' : 'var(--border-subtle)',
                }}
              >
                {key.replace('_', ' ')}
              </button>
            ))}
          </div>

          {isLoadingHistory && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Retrieving feedback history...
            </div>
          )}

          {!isLoadingHistory && filteredHistory.length === 0 && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No feedback submissions found in this category.
            </div>
          )}

          {!isLoadingHistory && filteredHistory.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredHistory.map((item) => {
                const isBug = item.type === 'BUG_REPORT';
                const isFeature = item.type === 'FEATURE_REQUEST';
                const badgeColor = isBug ? '#f43f5e' : isFeature ? '#f59e0b' : '#38bdf8';
                const badgeBg = isBug
                  ? 'rgba(244, 63, 94, 0.14)'
                  : isFeature
                  ? 'rgba(245, 158, 11, 0.14)'
                  : 'rgba(56, 189, 248, 0.14)';
                const label = isBug ? '🐞 Bug Report' : isFeature ? '💡 Feature Idea' : '💬 General';
                const isResolved = item.status === 'RESOLVED';
                const isReviewed = item.status === 'REVIEWED' || !!item.adminReply;

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '1.15rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: item.adminReply
                        ? '1px solid rgba(16, 185, 129, 0.35)'
                        : '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: item.adminReply ? '0 0 16px rgba(16, 185, 129, 0.08)' : 'none',
                    }}
                  >
                    {/* Header Row: Category Badge, Status Pill, & Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            color: badgeColor,
                            backgroundColor: badgeBg,
                            border: `1px solid ${badgeColor}40`,
                          }}
                        >
                          {label}
                        </span>

                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '5px',
                            color: isResolved || isReviewed ? '#34d399' : '#fbbf24',
                            backgroundColor: isResolved || isReviewed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                            border: isResolved || isReviewed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.25)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {isResolved ? 'RESOLVED' : isReviewed ? 'REVIEWED BY ADMIN' : 'PENDING REVIEW'}
                        </span>
                      </div>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Original Message */}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                        YOUR TRANSMISSION:
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                        {item.message}
                      </p>
                    </div>

                    {/* Admin Reply Box */}
                    {item.adminReply ? (
                      <div
                        style={{
                          marginTop: '0.35rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(16, 185, 129, 0.08)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              color: '#34d399',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            🛡️ Citadel Council / Admin Reply
                          </span>
                          {item.repliedAt && (
                            <span style={{ fontSize: '0.7rem', color: '#6ee7b7' }}>
                              {new Date(item.repliedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.86rem',
                            color: '#a7f3d0',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.adminReply}
                        </p>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--text-tertiary)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px dashed rgba(255, 255, 255, 0.08)',
                          fontStyle: 'italic',
                        }}
                      >
                        ⏳ Transmitted to Council — Awaiting evaluation.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
