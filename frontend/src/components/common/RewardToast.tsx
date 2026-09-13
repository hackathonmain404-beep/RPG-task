import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Coins, TrendingUp, X } from 'lucide-react';
import type { RewardNotice } from '../../context/questsContextDef';

interface RewardToastProps {
  reward: RewardNotice;
  onDismiss: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  intellect: 'Intellect',
  strength: 'Strength',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
  vitality: 'Vitality',
};

export const RewardToast: React.FC<RewardToastProps> = ({ reward, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  const triggerExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  }, [onDismiss]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerExit();
    }, 4000);
    return () => clearTimeout(timer);
  }, [triggerExit]);

  const hasXp = reward.xp != null && reward.xp > 0;
  const hasGold = reward.gold != null && reward.gold > 0;
  const hasAttr = reward.attribute != null && reward.attribute.amount > 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className={isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.2)',
        minWidth: '260px',
        maxWidth: '340px',
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={triggerExit}
        aria-label="Dismiss reward notification"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-xp)',
        }}
      >
        <Sparkles size={14} />
        Quest Rewards Claimed
      </div>

      {/* Reward Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {hasXp && (
          <div
            className="animate-number-pop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              animationDelay: '0.1s',
              opacity: 0,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-xp-bg)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="var(--color-xp)" />
            </div>
            <div>
              <div
                className="mono-numbers"
                style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d8b4fe' }}
              >
                +{reward.xp} XP
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Experience Gained
              </div>
            </div>
          </div>
        )}

        {hasGold && (
          <div
            className="animate-number-pop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              animationDelay: '0.25s',
              opacity: 0,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-gold-bg)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Coins size={16} color="var(--color-gold)" />
            </div>
            <div>
              <div
                className="mono-numbers"
                style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fef08a' }}
              >
                +{reward.gold} Gold
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Currency Earned
              </div>
            </div>
          </div>
        )}

        {hasAttr && (
          <div
            className="animate-number-pop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              animationDelay: '0.4s',
              opacity: 0,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={16} color="#38bdf8" />
            </div>
            <div>
              <div
                className="mono-numbers"
                style={{ fontSize: '1.15rem', fontWeight: 800, color: '#93c5fd' }}
              >
                +{reward.attribute!.amount}{' '}
                {CATEGORY_LABELS[reward.attribute!.key] || reward.attribute!.key}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                Attribute Growth
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
