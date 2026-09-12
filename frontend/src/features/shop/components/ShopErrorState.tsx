import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface ShopErrorStateProps {
  error: string;
  onRetry: () => void | Promise<void>;
}

export const ShopErrorState: React.FC<ShopErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div
      role="alert"
      className="rpg-card"
      style={{
        border: '1px solid rgba(239, 68, 68, 0.4)',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.15rem 1.4rem',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <AlertCircle size={24} color="var(--status-danger, #ef4444)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: '#fca5a5', fontSize: '0.95rem' }}>
            Armory Connection Notice
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.15rem' }}>
            {error}. Displaying canonical items.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void onRetry()}
        className="rpg-button secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          flexShrink: 0,
        }}
        aria-label="Retry"
      >
        <RotateCw size={14} />
        <span>Retry</span>
      </button>
    </div>
  );
};
