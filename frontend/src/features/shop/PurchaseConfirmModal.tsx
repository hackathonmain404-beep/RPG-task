import React, { useEffect, useRef } from 'react';
import type { ShopItem } from '../../types/contract';
import { Coins, AlertCircle, Loader2, X } from 'lucide-react';

interface PurchaseConfirmModalProps {
  item: ShopItem | null;
  isOpen: boolean;
  isProcessing: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  item,
  isOpen,
  isProcessing,
  error,
  onConfirm,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus confirmation button when opened
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="level-up-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-dialog-title"
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '16px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="purchase-dialog-title" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Confirm Citadel Acquisition
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '0.25rem',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Summary Card */}
        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-surface-sunken)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {item.name}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--border-focus)',
              }}
            >
              {item.itemType}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            {item.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', marginTop: '0.5rem' }}>
            <Coins size={18} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Price:</span>
            <span className="mono-numbers" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {item.price.toLocaleString()} Gold
            </span>
          </div>
        </div>

        {/* Transaction Notice */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
          Acquiring this item will dispatch an authoritative purchase request to the Citadel database. Your wallet will only be debited upon verified server confirmation.
        </p>

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} color="var(--status-danger)" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Dialog Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rpg-button secondary"
            style={{ padding: '0.6rem 1.25rem' }}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="rpg-button primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.5rem',
              fontWeight: 700,
            }}
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <span>Confirm Purchase</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
