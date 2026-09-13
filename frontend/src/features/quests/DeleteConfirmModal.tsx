import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Task } from '../../types/contract';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !task) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: 'min(92vw, 440px)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          padding: 'clamp(1.25rem, 3.5vw, 1.75rem)',
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <AlertTriangle size={26} color="#ef4444" />
        </div>

        <h2 id="delete-modal-title" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          Abandon Quest?
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          Are you sure you wish to abandon <strong style={{ color: 'var(--text-primary)' }}>&ldquo;{task.title}&rdquo;</strong>? 
          This will permanently remove the quest from the Citadel board.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.65rem 1.25rem', minHeight: '42px', flex: '1 1 120px' }}
          >
            Keep Quest
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rpg-btn rpg-btn-danger"
            style={{ padding: '0.65rem 1.25rem', minHeight: '42px', flex: '1 1 120px' }}
          >
            {isDeleting ? 'Abandoning...' : 'Abandon Quest'}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

