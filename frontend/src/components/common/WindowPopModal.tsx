import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  X, 
  Loader2 
} from 'lucide-react';

export type PopModalType = 'danger' | 'warning' | 'info' | 'success';

export interface WindowPopModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  type?: PopModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  isLoading?: boolean;
}

export const WindowPopModal: React.FC<WindowPopModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      } else if (e.key === 'Enter' && isOpen && !isLoading && onConfirm) {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose, onConfirm]);

  if (!isOpen) return null;

  const isAlertOnly = !onConfirm;

  const getStyleConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} color="#ef4444" />,
          iconBg: 'rgba(239, 68, 68, 0.15)',
          iconBorder: 'rgba(239, 68, 68, 0.35)',
          cardBorder: 'rgba(239, 68, 68, 0.4)',
          glow: '0 0 35px rgba(239, 68, 68, 0.22)',
          btnClass: 'rpg-btn-danger',
          titleColor: '#fca5a5',
          defaultConfirmText: 'Confirm Delete',
        };
      case 'warning':
        return {
          icon: <AlertCircle size={24} color="#f59e0b" />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconBorder: 'rgba(245, 158, 11, 0.35)',
          cardBorder: 'rgba(245, 158, 11, 0.4)',
          glow: '0 0 35px rgba(245, 158, 11, 0.22)',
          btnClass: 'rpg-btn-primary',
          titleColor: '#fde68a',
          defaultConfirmText: 'Proceed',
        };
      case 'success':
        return {
          icon: <CheckCircle2 size={24} color="#10b981" />,
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconBorder: 'rgba(16, 185, 129, 0.35)',
          cardBorder: 'rgba(16, 185, 129, 0.4)',
          glow: '0 0 35px rgba(16, 185, 129, 0.22)',
          btnClass: 'rpg-btn-primary',
          titleColor: '#a7f3d0',
          defaultConfirmText: 'OK',
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} color="#38bdf8" />,
          iconBg: 'rgba(56, 189, 248, 0.15)',
          iconBorder: 'rgba(56, 189, 248, 0.35)',
          cardBorder: 'rgba(56, 189, 248, 0.4)',
          glow: '0 0 35px rgba(56, 189, 248, 0.22)',
          btnClass: 'rpg-btn-primary',
          titleColor: '#bae6fd',
          defaultConfirmText: 'Acknowledge',
        };
    }
  };

  const config = getStyleConfig();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'modalFadeIn 0.18s ease-out forwards',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="window-pop-modal-title"
    >
      <div
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0b0f19',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          border: `1px solid ${config.cardBorder}`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.85), ${config.glow}`,
          borderRadius: '16px',
          padding: '1.75rem',
          position: 'relative',
          textAlign: 'left',
          animation: 'modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.1rem',
              right: '1.1rem',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f8fafc';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}

        {/* Modal Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: config.iconBg,
              border: `1px solid ${config.iconBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>

          <div style={{ paddingRight: '1.5rem' }}>
            <h2
              id="window-pop-modal-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h2>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: config.titleColor,
                marginTop: '0.2rem',
              }}
            >
              System Message
            </span>
          </div>
        </div>

        {/* Message Body */}
        <div
          style={{
            fontSize: '0.92rem',
            color: '#cbd5e1',
            lineHeight: 1.55,
            marginBottom: '1.75rem',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            wordBreak: 'break-word',
          }}
        >
          {message}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
          {!isAlertOnly && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rpg-btn rpg-btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.88rem' }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
            disabled={isLoading}
            className={`rpg-btn ${config.btnClass}`}
            style={{
              padding: '0.6rem 1.35rem',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
            autoFocus
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText || (isAlertOnly ? 'OK' : config.defaultConfirmText)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
