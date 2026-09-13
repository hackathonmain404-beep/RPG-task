import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  actionLink,
  style,
}) => {
  return (
    <div
      className="rpg-card"
      style={{
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface-sunken)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--text-tertiary)',
        }}
      >
        {icon || <Sparkles size={28} color="var(--text-tertiary)" />}
      </div>

      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.5rem', fontWeight: 700 }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
        {description}
      </p>

      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="rpg-button primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', minHeight: '42px' }}
        >
          <Sparkles size={16} />
          <span>{actionText}</span>
        </Link>
      )}

      {!actionLink && onAction && actionText && (
        <button
          type="button"
          onClick={onAction}
          className="rpg-button primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', minHeight: '42px' }}
        >
          <Sparkles size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
