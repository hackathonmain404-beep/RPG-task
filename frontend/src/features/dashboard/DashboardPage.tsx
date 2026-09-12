import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useQuests } from '../../context/useQuests';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { characterApi, type CharacterResponse } from '../../services/api/character';
import { RewardToast } from '../../components/common/RewardToast';
import { LevelUpOverlay } from '../../components/common/LevelUpOverlay';
import type { Attribute } from '../../types/contract';
import { useCardMotion } from './hooks/useCardMotion';
import './dashboard-analytics.css';
import './dashboard-interactions.css';

import { ProductivityTrendsCard } from './components/ProductivityTrendsCard';
import { CompletedCategoriesCard } from './components/CompletedCategoriesCard';
import { VibeScoreCard } from './components/VibeScoreCard';
import { ConsistencyHeatmapCard } from './components/ConsistencyHeatmapCard';
import { AccountabilityMatrix } from './components/AccountabilityMatrix';
import { 
  Shield, 
  Flame, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Heart,
  ChevronDown,
  Database
} from 'lucide-react';

// Attribute icon/color map
const ATTR_CONFIG: Record<string, { icon: React.FC<{ size?: number; color?: string }>; color: string; focus: string }> = {
  intellect: { icon: Brain, color: 'var(--attr-intellect)', focus: 'Technical & Logic' },
  strength: { icon: Dumbbell, color: 'var(--attr-strength)', focus: 'Physical Fitness' },
  wisdom: { icon: BookOpen, color: 'var(--attr-wisdom)', focus: 'Study & Reading' },
  charisma: { icon: Sparkles, color: 'var(--attr-charisma)', focus: 'Social & Team' },
  vitality: { icon: Heart, color: 'var(--attr-vitality)', focus: 'Sleep & Health' },
};

const DEFAULT_ATTRIBUTES: Attribute[] = [
  { key: 'intellect', displayName: 'Intellect', value: 0 },
  { key: 'strength', displayName: 'Strength', value: 0 },
  { key: 'wisdom', displayName: 'Wisdom', value: 0 },
  { key: 'charisma', displayName: 'Charisma', value: 0 },
  { key: 'vitality', displayName: 'Vitality', value: 0 },
];

interface StatCardProps {
  label: string;
  icon: React.ReactNode;
  iconClassName: string;
  cardTypeClass: string;
  value: React.ReactNode;
  valueColor?: string;
  subValue?: React.ReactNode;
  subValueColor?: string;
  footerText?: React.ReactNode;
  progressBar?: {
    percent: number;
    gradient: string;
  };
}

const InteractiveStatCard: React.FC<StatCardProps> = ({
  label,
  icon,
  iconClassName,
  cardTypeClass,
  value,
  valueColor = '#ffffff',
  subValue,
  subValueColor,
  footerText,
  progressBar,
}) => {
  const { cardRef, handleMouseMove, handleMouseLeave } = useCardMotion<HTMLDivElement>({
    maxTiltDeg: 2.5,
  });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`interactive-stat-card ${cardTypeClass}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span className="rpg-label">{label}</span>
        <div className={`stat-icon-box ${iconClassName}`}>
          {icon}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 800, color: valueColor }}>
          {value}
        </span>
        {subValue && (
          <span style={{ fontSize: '0.85rem', color: subValueColor || 'var(--text-secondary)', fontWeight: 600 }}>
            {subValue}
          </span>
        )}
      </div>
      {progressBar && (
        <div className="rpg-progress-track" style={{ height: '4px', marginTop: '0.5rem' }}>
          <div
            className="rpg-progress-fill mini-bar-animated"
            style={{
              ['--target-width' as string]: `${Math.max(2, Math.min(100, progressBar.percent))}%`,
              width: `${Math.max(2, Math.min(100, progressBar.percent))}%`,
              background: progressBar.gradient,
              transition: 'width 0.8s var(--ease-spring)',
            }}
          />
        </div>
      )}
      {footerText && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
          {footerText}
        </p>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  useDocumentMetadata('Command Citadel | Achiever', { noindex: true });

  const { character, xpProgress } = useAuth();
  const { tasks, lastRewardNotice, clearRewardNotice, levelUpEvent, clearLevelUpEvent } = useQuests();

  const [charData, setCharData] = useState<CharacterResponse | null>(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streak = character?.streakCurrent || 0;

  // Server-authoritative XP progress
  const xpPercent = xpProgress?.progressPercent ?? 0;

  // Fetch character attributes
  useEffect(() => {
    let ignore = false;
    characterApi.getCharacter()
      .then(data => { if (!ignore) setCharData(data); })
      .catch(() => { /* supplementary data for dashboard */ });
    return () => { ignore = true; };
  }, []);

  const attributes: Attribute[] = charData?.attributes && charData.attributes.length > 0
    ? charData.attributes
    : (character?.attributes && character.attributes.length > 0)
      ? character.attributes
      : DEFAULT_ATTRIBUTES;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Reward Toast */}
      {lastRewardNotice && (
        <div className="reward-toast-container">
          <RewardToast reward={lastRewardNotice} onDismiss={clearRewardNotice} />
        </div>
      )}

      {/* Level-Up Overlay */}
      {levelUpEvent && (
        <LevelUpOverlay event={levelUpEvent} onDismiss={clearLevelUpEvent} />
      )}

      {/* Welcome / Session Banner */}
      <div
        className="anim-entrance-3"
        style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div>
          <div className="session-badge-live">
            <Sparkles size={13} className="session-badge-live-icon" />
            <span>CITADEL ACTIVE SESSION</span>
          </div>

          <h1 className="welcome-headline-animated" style={{ fontSize: '2.1rem', marginBottom: '0.5rem', fontWeight: 800 }}>
            Welcome back, Achiever!
          </h1>

          <p className="welcome-desc-animated" style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '1rem', lineHeight: 1.55 }}>
            Your journey continues. Make your next move count.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/app/character"
            className="btn-character-sheet"
            id="dashboard-character-sheet-btn"
          >
            <span>Character Sheet</span>
            <ArrowRight size={16} className="btn-cta-arrow" />
          </Link>
        </div>
      </div>

      {/* Quick Metrics Grid (4 Stat Cards with 3D Tilt & Cursor Light) */}
      <div
        className="anim-entrance-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Metric 1: Level + XP Progress */}
        <InteractiveStatCard
          label="Player Level"
          cardTypeClass="card-player-level"
          iconClassName="stat-icon-shield"
          icon={<Shield size={18} color="#a855f7" />}
          value={level}
          subValue={`${Math.round(xpPercent)}% to next`}
          subValueColor="var(--color-xp)"
          progressBar={{
            percent: xpPercent,
            gradient: 'linear-gradient(90deg, #a855f7, #c084fc)',
          }}
        />

        {/* Metric 2: Total XP */}
        <InteractiveStatCard
          label="Authoritative EXP"
          cardTypeClass="card-auth-xp"
          iconClassName="stat-icon-sparkles"
          icon={<Sparkles size={18} color="#38bdf8" />}
          value={totalXp.toLocaleString()}
          subValue="XP"
          footerText="Verified PostgreSQL record"
        />

        {/* Metric 3: Gold */}
        <InteractiveStatCard
          label="Armory Gold"
          cardTypeClass="card-armory-gold"
          iconClassName="stat-icon-coins"
          icon={<Coins size={18} color="#f59e0b" />}
          value={gold.toLocaleString()}
          valueColor="#fef08a"
          subValue="Coins"
          subValueColor="var(--color-gold)"
          footerText="Spendable in the Armory"
        />

        {/* Metric 4: Streak */}
        <InteractiveStatCard
          label="Momentum Streak"
          cardTypeClass="card-momentum-streak"
          iconClassName="stat-icon-flame"
          icon={<Flame size={18} color="#ef4444" />}
          value={streak}
          valueColor="#fca5a5"
          subValue="Days"
          subValueColor="var(--color-streak)"
          footerText={`Best: ${character?.streakBest || 0} days`}
        />
      </div>

      {/* Productivity & Accountability Analytics */}
      <div className="analytics-dashboard-section">
        {/* Row 1: Productivity Trends & Completed Categories */}
        <div className="analytics-row-1">
          <ProductivityTrendsCard tasks={tasks} />
          <CompletedCategoriesCard tasks={tasks} />
        </div>

        {/* Row 2: Vibe Score & 35-Day Consistency Heatmap */}
        <div className="analytics-row-2">
          <VibeScoreCard tasks={tasks} />
          <ConsistencyHeatmapCard tasks={tasks} />
        </div>

        {/* Optional Collapsible: The Accountability Matrix */}
        <div className="analytics-row-3">
          <button
            type="button"
            id="accountability-matrix-toggle"
            onClick={() => setIsMatrixOpen(prev => !prev)}
            className={`audit-drawer-toggle ${isMatrixOpen ? 'is-open' : ''}`}
            aria-expanded={isMatrixOpen}
            aria-controls="accountability-matrix-panel"
          >
            <div className="audit-drawer-label">
              <Database size={16} className="audit-drawer-icon" />
              <span>The Accountability Matrix</span>
            </div>
            <ChevronDown size={16} className={`audit-drawer-chevron ${isMatrixOpen ? 'rotated' : ''}`} />
          </button>

          <div
            id="accountability-matrix-panel"
            role="region"
            aria-labelledby="accountability-matrix-toggle"
            className={`audit-drawer-content ${isMatrixOpen ? 'is-open' : ''}`}
          >
            <div className="audit-drawer-inner">
              <div style={{ paddingTop: '1rem' }}>
                <AccountabilityMatrix tasks={tasks} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disciplines Snapshot — Real Attribute Data */}
      <div className="anim-entrance-8">
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Character Disciplines</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Server-authoritative attribute progression across the 5 core domains.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {attributes.map(attr => {
            const attrKey = attr.key.toLowerCase();
            const config = ATTR_CONFIG[attrKey] || {
              icon: Brain,
              color: 'var(--text-secondary)',
              focus: attr.displayName,
            };
            const Icon = config.icon;
            return (
              <div
                key={attr.key}
                className={`discipline-stat-card discipline-card-${attrKey}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div className="discipline-icon-wrapper">
                    <Icon size={18} color={config.color} />
                  </div>
                  <span className="discipline-card-title" style={{ color: config.color }}>
                    {attr.displayName}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{config.focus}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div className="rpg-progress-track" style={{ height: '6px', flex: 1 }}>
                    <div
                      className="rpg-progress-fill mini-bar-animated"
                      style={{
                        ['--target-width' as string]: `${Math.min(100, attr.value * 5)}%`,
                        width: `${Math.min(100, attr.value * 5)}%`,
                        backgroundColor: config.color,
                        transition: 'width 0.6s var(--ease-spring)',
                      }}
                    />
                  </div>
                  <span
                    className="mono-numbers discipline-card-number"
                    style={{ color: config.color }}
                  >
                    {attr.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
