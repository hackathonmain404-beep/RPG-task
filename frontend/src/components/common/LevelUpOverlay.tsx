import React from 'react';
import { Shield, ArrowRight } from 'lucide-react';
import type { LevelUpEvent } from '../../context/questsContextDef';

interface LevelUpOverlayProps {
  event: LevelUpEvent;
  onDismiss: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ event, onDismiss }) => {
  return (
    <div
      className="level-up-backdrop"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={`Level Up! You advanced from Level ${event.levelBefore} to Level ${event.levelAfter}`}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-in-up"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid rgba(168, 85, 247, 0.5)',
          borderRadius: '20px',
          padding: '3rem 3.5rem',
          textAlign: 'center',
          maxWidth: '420px',
          width: '90vw',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Shield Icon with level number */}
        <div
          className="animate-shield-entrance animate-level-up-pulse"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            border: '2px solid rgba(168, 85, 247, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            position: 'relative',
          }}
        >
          <Shield size={52} color="#a855f7" />
          <span
            className="mono-numbers"
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              backgroundColor: '#a855f7',
              color: '#090c10',
              borderRadius: '8px',
              padding: '0.2rem 0.5rem',
              fontSize: '1.1rem',
              fontWeight: 900,
              boxShadow: 'var(--glow-xp)',
            }}
          >
            {event.levelAfter}
          </span>
        </div>

        {/* LEVEL UP heading */}
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #c084fc, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}
        >
          Level Up!
        </h2>

        {/* Level transition */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <span
            className="mono-numbers"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
            }}
          >
            Lvl {event.levelBefore}
          </span>
          <ArrowRight size={24} color="#a855f7" />
          <span
            className="mono-numbers"
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#d8b4fe',
              textShadow: '0 0 12px rgba(168, 85, 247, 0.5)',
            }}
          >
            Lvl {event.levelAfter}
          </span>
        </div>

        {/* Motivational text */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            marginBottom: '2rem',
            maxWidth: '300px',
            margin: '0 auto 2rem',
          }}
        >
          Your dedication has been recognized by the Citadel. New challenges await, Adventurer.
        </p>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={onDismiss}
          className="rpg-btn rpg-btn-primary"
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            borderColor: 'rgba(168, 85, 247, 0.5)',
            boxShadow: 'var(--glow-xp)',
          }}
          autoFocus
        >
          Continue Adventure
        </button>
      </div>
    </div>
  );
};
