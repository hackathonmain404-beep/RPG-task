import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Clock } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  phase: string;
  description: string;
  icon: LucideIcon;
  upcomingFeatures: string[];
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  phase,
  description,
  icon: Icon,
  upcomingFeatures,
}) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div
        className="rpg-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid var(--border-strong)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)',
          }}
        >
          <Icon size={32} color="#38bdf8" />
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          <Clock size={14} /> Scheduled for {phase}
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{title}</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {description}
        </p>

        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: '10px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Planned Capabilities in {phase}:
          </h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
            {upcomingFeatures.map(feat => (
              <li key={feat}>{feat}</li>
            ))}
          </ul>
        </div>

        <Link to="/app/dashboard" className="rpg-btn rpg-btn-secondary" style={{ padding: '0.7rem 1.5rem' }}>
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
