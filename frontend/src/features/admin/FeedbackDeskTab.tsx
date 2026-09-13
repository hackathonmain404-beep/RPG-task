import React, { useState, useEffect, useCallback } from 'react';
import { getAdminFeedback, replyAdminFeedback, deleteAdminFeedback } from '../../services/api/admin';
import type { AdminFeedbackItem, FeedbackType } from '../../types/contract';
import { 
  Inbox, 
  Bug, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Reply, 
  Loader2, 
  X, 
  Check, 
  Crown
} from 'lucide-react';
import { WindowPopModal } from '../../components/common/WindowPopModal';

export const FeedbackDeskTab: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | FeedbackType>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Reply Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedbackItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('REVIEWED');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Pop Modal State (replaces native window.confirm & alert)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingFeedback, setIsDeletingFeedback] = useState<boolean>(false);
  const [popAlert, setPopAlert] = useState<{ title: string; message: string; type?: 'danger' | 'warning' | 'info' | 'success' } | null>(null);

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setErrorText(null);
    try {
      const res = await getAdminFeedback();
      const list = (res as any).feedbacks || res.feedback || [];
      setFeedbackList(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to fetch player feedback.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const filteredFeedbacks = feedbackList.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.type === activeFilter;
  });

  const handleOpenReplyModal = (item: AdminFeedbackItem) => {
    setSelectedFeedback(item);
    setReplyText(item.adminReply || '');
    setNewStatus(item.status === 'PENDING' ? 'REVIEWED' : item.status);
    setReplySuccessMsg(null);
  };

  const handleCloseReplyModal = () => {
    setSelectedFeedback(null);
    setIsSubmittingReply(false);
    setReplySuccessMsg(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !replyText.trim()) return;

    setIsSubmittingReply(true);
    setErrorText(null);

    try {
      const statusToSet = newStatus || 'REVIEWED';
      const res = await replyAdminFeedback(selectedFeedback.id, replyText.trim(), statusToSet);
      setReplySuccessMsg('Admin reply sent to user & status updated to Reviewed!');

      // Update in local state
      const updated = res.feedback;
      setFeedbackList(prev =>
        prev.map(f => (f.id === selectedFeedback.id ? { 
          ...f, 
          ...(updated || {}),
          adminReply: replyText.trim(),
          status: statusToSet,
        } : f))
      );

      setTimeout(() => {
        handleCloseReplyModal();
        void fetchFeedback();
      }, 1000);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to submit admin reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteFeedback = async () => {
    if (!deleteTargetId) return;

    setIsDeletingFeedback(true);
    try {
      await deleteAdminFeedback(deleteTargetId);
      setFeedbackList(prev => prev.filter(f => f.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: any) {
      setPopAlert({
        title: 'Delete Failed',
        message: err?.message || 'Failed to delete feedback record.',
        type: 'danger',
      });
    } finally {
      setIsDeletingFeedback(false);
    }
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'BUG_REPORT': return <Bug size={14} color="#f87171" />;
      case 'FEATURE_REQUEST': return <Sparkles size={14} color="#c084fc" />;
      case 'GENERAL': return <HelpCircle size={14} color="#38bdf8" />;
    }
  };

  const getTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case 'BUG_REPORT': return 'Bug Report';
      case 'FEATURE_REQUEST': return 'Feature Request';
      case 'GENERAL': return 'General Feedback';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Filter Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Inbox size={22} color="#38bdf8" />
            <span>Player Feedback & Triage Desk</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Review suggestions and bug reports sent by adventurers, reply directly, and mark resolved.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Items' },
            { key: 'BUG_REPORT', label: 'Bugs' },
            { key: 'FEATURE_REQUEST', label: 'Features' },
            { key: 'GENERAL', label: 'General' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFilter(key as any)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: activeFilter === key ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: activeFilter === key ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: activeFilter === key ? '#38bdf8' : '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {errorText && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}
        >
          {errorText}
        </div>
      )}

      {/* Feedback Feed */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem', color: '#38bdf8' }}>
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
          }}
        >
          No feedback tickets found in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredFeedbacks.map((f) => {
            const isResolved = f.status === 'RESOLVED';

            return (
              <div
                key={f.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: isResolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#e2e8f0',
                      }}
                    >
                      {getTypeIcon(f.type)}
                      <span>{getTypeLabel(f.type)}</span>
                    </span>

                    {(() => {
                      const isRev = f.status === 'REVIEWED' || f.status === 'RESOLVED';
                      const color = f.status === 'REVIEWED' ? '#38bdf8' : f.status === 'RESOLVED' ? '#10b981' : '#fbbf24';
                      const bg = f.status === 'REVIEWED' ? 'rgba(56, 189, 248, 0.15)' : f.status === 'RESOLVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
                      const border = f.status === 'REVIEWED' ? '1px solid rgba(56, 189, 248, 0.4)' : f.status === 'RESOLVED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)';
                      return (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            backgroundColor: bg,
                            border,
                            color,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {isRev ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          <span>{f.status === 'REVIEWED' ? 'REVIEWED BY ADMIN' : f.status}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {new Date(f.createdAt).toLocaleDateString()} at {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Submitter info */}
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Submitted by: <strong style={{ color: '#f8fafc' }}>{f.userName || 'Hero'}</strong> ({f.userEmail || f.userId})
                </div>

                {/* Feedback Message */}
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                  }}
                >
                  {f.message}
                </div>

                {/* Nested Admin Reply */}
                {f.adminReply && (
                  <div
                    style={{
                      background: 'rgba(124, 58, 237, 0.1)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      marginLeft: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <Crown size={14} />
                      <span>Admin Response</span>
                      {f.repliedAt && (
                        <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.72rem' }}>
                          — {new Date(f.repliedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#f8fafc', fontSize: '0.85rem', lineHeight: 1.45 }}>
                      {f.adminReply}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenReplyModal(f)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '6px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Reply size={14} />
                    <span>{f.adminReply ? 'Update Reply' : 'Reply & Triage'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFeedback(f.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------- */}
      {/* REPLY & TRIAGE MODAL                                           */}
      {/* -------------------------------------------------------------- */}
      {selectedFeedback && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={handleCloseReplyModal}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseReplyModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Reply size={16} />
                <span>Feedback Desk Response</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                Reply to {selectedFeedback.userName || 'Hero'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                Ticket: <code style={{ color: '#e2e8f0' }}>{selectedFeedback.id.slice(0, 12)}...</code>
              </p>
            </div>

            {/* Original message quote */}
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 0.9rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.82rem',
                color: '#cbd5e1',
                fontStyle: 'italic',
              }}
            >
              &quot;{selectedFeedback.message}&quot;
            </div>

            {replySuccessMsg ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '10px',
                  color: '#10b981',
                }}
              >
                <Check size={32} style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Reply Sent!</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{replySuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Admin Response Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write your official response to the player..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Ticket Status
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['REVIEWED', 'RESOLVED', 'PENDING'].map(s => {
                      const isSelected = newStatus === s;
                      const activeColor = s === 'REVIEWED' ? '#38bdf8' : s === 'RESOLVED' ? '#10b981' : '#fbbf24';
                      const activeBg = s === 'REVIEWED' ? 'rgba(56, 189, 248, 0.2)' : s === 'RESOLVED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)';
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewStatus(s)}
                          style={{
                            flex: 1,
                            padding: '0.55rem',
                            borderRadius: '6px',
                            background: isSelected ? activeBg : 'rgba(255, 255, 255, 0.04)',
                            border: isSelected ? `1px solid ${activeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isSelected ? activeColor : '#94a3b8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseReplyModal}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#94a3b8',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReply || !replyText.trim()}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: isSubmittingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    }}
                  >
                    {isSubmittingReply ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Reply...</span>
                      </>
                    ) : (
                      <>
                        <Reply size={16} />
                        <span>Submit Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Window Pop Modal for Deletion Confirmation */}
      <WindowPopModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteFeedback}
        isLoading={isDeletingFeedback}
        title="Delete Feedback Record?"
        message="Are you sure you want to permanently delete this feedback submission? This will purge the entry from the database."
        type="danger"
        confirmText="Permanently Delete"
        cancelText="Cancel"
      />

      {/* Window Pop Modal for Notifications/Errors */}
      {popAlert && (
        <WindowPopModal
          isOpen={Boolean(popAlert)}
          onClose={() => setPopAlert(null)}
          title={popAlert.title}
          message={popAlert.message}
          type={popAlert.type || 'info'}
        />
      )}
    </div>
  );
};
