import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useQuests } from '../../context/useQuests';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
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
import { DashboardSkeleton } from '../../components/skeletons/DashboardSkeleton';
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
  Database,
  Trophy,
  Sliders
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
  headerAction?: React.ReactNode;
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
  headerAction,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span className="rpg-label">{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {headerAction}
          <div className={`stat-icon-box ${iconClassName}`}>
            {icon}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className="mono-numbers" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.15rem)', fontWeight: 800, color: valueColor, lineHeight: 1 }}>
          {value}
        </span>
        {subValue && (
          <span style={{ fontSize: '0.82rem', color: subValueColor || 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.01em' }}>
            {subValue}
          </span>
        )}
      </div>
      {progressBar && (
        <div className="rpg-progress-track" style={{ height: '6px', marginTop: '0.65rem', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
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
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.45rem', lineHeight: 1.4 }}>
          {footerText}
        </p>
      )}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  useDocumentMetadata('Command Citadel | Achiever', { noindex: true });

  const { character, xpProgress, isLoading: authLoading, refreshCharacter } = useAuth();
  const { tasks, lastRewardNotice, clearRewardNotice, levelUpEvent, clearLevelUpEvent } = useQuests();
  const { openLeaderboard } = useLeaderboard();

  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streak = character?.streakCurrent || 0;

  // Server-authoritative XP progress
  const xpPercent = xpProgress?.progressPercent ?? 0;

  // Revalidate character sheet with database on mount
  useEffect(() => {
    void refreshCharacter();
  }, [refreshCharacter]);

  const attributes: Attribute[] = (character?.attributes && character.attributes.length > 0)
    ? character.attributes
    : DEFAULT_ATTRIBUTES;

  if (authLoading && !character) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="dashboard-main-flow" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
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
      <div className="welcome-banner-card anim-entrance-3">
        <div className="welcome-content-block">
          <div className="session-badge-live">
            <Sparkles size={12} className="session-badge-live-icon" />
            <span>CITADEL • ACTIVE SESSION</span>
          </div>

          <h1 className="welcome-headline-animated">
            Welcome back, Achiever!
          </h1>

          <p className="welcome-desc-animated">
            Your journey continues. Make your next move count.
          </p>
        </div>

        <div className="welcome-action-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={openLeaderboard}
            className="rpg-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.15rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#fbbf24',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minHeight: '42px',
            }}
            id="dashboard-leaderboard-btn"
            title="Open Global Leaderboard"
          >
            <Trophy size={16} color="#fbbf24" />
            <span>Leaderboard</span>
          </button>

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
        className="anim-entrance-4 dashboard-metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1: Level + XP Progress */}
        <InteractiveStatCard
          label="Player Level"
          cardTypeClass="card-player-level"
          iconClassName="stat-icon-shield"
          icon={<Shield size={18} color="#a855f7" />}
          headerAction={
            <Link
              to="/app/settings"
              className="stat-card-header-action"
              title="Citadel System & Accessibility"
              aria-label="System Settings"
            >
              <Sliders size={14} />
            </Link>
          }
          value={level}
          subValue={`${Math.round(xpPercent)}% to next`}
          subValueColor="var(--color-xp)"
          progressBar={{
            percent: xpPercent,
            gradient: 'var(--theme-primary, var(--color-xp, #a855f7))',
          }}
        />

        {/* Metric 2: Total XP / Experience */}
        <InteractiveStatCard
          label="Experience"
          cardTypeClass="card-auth-xp"
          iconClassName="stat-icon-sparkles"
          icon={<Sparkles size={18} color="#38bdf8" />}
          value={totalXp.toLocaleString()}
          subValue="XP"
          footerText="Your current experience"
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
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
