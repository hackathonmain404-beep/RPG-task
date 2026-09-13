import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Citadel Synchronization Warning',
  message = 'Unable to establish authoritative connection with Citadel engine. Please verify your connection or retry.',
  onRetry,
  retryText = 'Try Again',
  compact = false,
  style,
}) => {
  if (compact) {
    return (
      <div
        role="alert"
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '10px',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <AlertCircle size={18} color="var(--status-danger, #ef4444)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flexShrink: 0 }}
          >
            <RotateCcw size={13} /> {retryText}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rpg-card"
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '560px',
        margin: '2rem auto',
        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
        ...style,
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
        }}
      >
        <AlertCircle size={28} color="var(--status-danger, #ef4444)" />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fca5a5', margin: '0 0 0.4rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rpg-button primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.4rem',
            fontSize: '0.88rem',
            minHeight: '42px',
          }}
        >
          <RotateCcw size={15} />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};
