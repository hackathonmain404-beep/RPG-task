import React from 'react';
import type { Attribute } from '../../types/contract';
import type { AttributeChangeNotice } from '../../context/authContextDef';
import { Brain, Dumbbell, BookOpen, Sparkles, Heart, ArrowRight } from 'lucide-react';

interface AttributeCardProps {
  attribute: Attribute;
  changeNotice?: AttributeChangeNotice | null;
}

const ATTRIBUTE_METADATA: Record<
  string,
  {
    icon: React.FC<{ size?: number; color?: string }>;
    colorVar: string;
    bgVar: string;
    domain: string;
    tagline: string;
  }
> = {
  intellect: {
    icon: Brain,
    colorVar: 'var(--attr-intellect)',
    bgVar: 'var(--attr-intellect-bg)',
    domain: 'Logic & Code',
    tagline: 'Technical mastery, algorithmic problem-solving & architecture.',
  },
  strength: {
    icon: Dumbbell,
    colorVar: 'var(--attr-strength)',
    bgVar: 'var(--attr-strength-bg)',
    domain: 'Physical Conditioning',
    tagline: 'Cardio endurance, strength training & physical resilience.',
  },
  wisdom: {
    icon: BookOpen,
    colorVar: 'var(--attr-wisdom)',
    bgVar: 'var(--attr-wisdom-bg)',
    domain: 'Deep Reflection',
    tagline: 'Reading, philosophical study, meditation & tactical clarity.',
  },
  charisma: {
    icon: Sparkles,
    colorVar: 'var(--attr-charisma)',
    bgVar: 'var(--attr-charisma-bg)',
    domain: 'Social Resonance',
    tagline: 'Public speaking, team leadership, mentorship & empathy.',
  },
  vitality: {
    icon: Heart,
    colorVar: 'var(--attr-vitality)',
    bgVar: 'var(--attr-vitality-bg)',
    domain: 'Health & Recovery',
    tagline: 'Sleep hygiene, clean nutrition, hydration & mental calm.',
  },
};

export const AttributeCard: React.FC<AttributeCardProps> = ({ attribute, changeNotice }) => {
  const meta = ATTRIBUTE_METADATA[attribute.key.toLowerCase()] || {
    icon: Brain,
    colorVar: 'var(--text-secondary)',
    bgVar: 'rgba(255, 255, 255, 0.05)',
    domain: attribute.displayName,
    tagline: 'General adventurer discipline.',
  };

  const Icon = meta.icon;
  const isRecentlyUpdated = changeNotice && changeNotice.key.toLowerCase() === attribute.key.toLowerCase();

  // Calculate visual progress meter (bounded between 0 and 100)
  // Uses server-authoritative value without altering backend state
  const meterPercent = attribute.value === 0 ? 0 : Math.min(100, attribute.value * 4);

  return (
    <div
      className={`rpg-card ${isRecentlyUpdated ? 'attribute-card-updated' : ''}`}
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        border: isRecentlyUpdated ? `2px solid ${meta.colorVar}` : '1px solid var(--border-subtle)',
        boxShadow: isRecentlyUpdated ? `0 0 20px ${meta.colorVar}40` : undefined,
        transition: 'border 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Row: Icon, Title, Domain, and Level Value */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: meta.bgVar,
              border: `1px solid ${meta.colorVar}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={meta.colorVar} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {attribute.displayName}
              </h3>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: meta.bgVar,
                  color: meta.colorVar,
                }}
              >
                {meta.domain}
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {meta.tagline}
            </p>
          </div>
        </div>

        {/* Current Authoritative Value */}
        <div style={{ textAlign: 'right', minWidth: '60px', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
            Rank
          </span>
          <span className="mono-numbers" style={{ fontSize: '1.35rem', fontWeight: 800, color: meta.colorVar }}>
            {attribute.value}
          </span>
        </div>
      </div>

      {/* Visual Attribute Change Communication (Wisdom 42 → 44 (+2)) */}
      {isRecentlyUpdated && changeNotice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            backgroundColor: meta.bgVar,
            border: `1px solid ${meta.colorVar}60`,
            fontSize: '0.825rem',
            fontWeight: 700,
            color: meta.colorVar,
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <span>Server Reward:</span>
          <span className="mono-numbers" style={{ color: 'var(--text-secondary)' }}>
            {changeNotice.prevValue ?? (attribute.value - changeNotice.amount)}
          </span>
          <ArrowRight size={14} />
          <span className="mono-numbers" style={{ color: 'var(--text-primary)' }}>
            {changeNotice.newValue ?? attribute.value}
          </span>
          <span
            style={{
              marginLeft: 'auto',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: meta.colorVar,
              color: '#ffffff',
              fontSize: '0.75rem',
            }}
          >
            +{changeNotice.amount}
          </span>
        </div>
      )}

      {/* Authoritative Strength / Mastery Meter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
          <span>Discipline Mastery</span>
          <span className="mono-numbers">{attribute.value} pts</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={attribute.value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${attribute.displayName} mastery score: ${attribute.value}`}
          className="rpg-progress-track"
          style={{ height: '8px' }}
        >
          <div
            className="rpg-progress-fill"
            style={{
              width: `${meterPercent}%`,
              backgroundColor: meta.colorVar,
              transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
