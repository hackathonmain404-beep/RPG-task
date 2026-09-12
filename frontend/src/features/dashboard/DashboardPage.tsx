import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useQuests } from '../../context/useQuests';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { characterApi, type CharacterResponse } from '../../services/api/character';
import { RewardToast } from '../../components/common/RewardToast';
import { LevelUpOverlay } from '../../components/common/LevelUpOverlay';
import type { Attribute } from '../../types/contract';
import './dashboard-analytics.css';
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
  Heart
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

export const DashboardPage: React.FC = () => {
  useDocumentMetadata('Command Citadel', { noindex: true });

  const { user, character, xpProgress } = useAuth();
  const { tasks, lastRewardNotice, clearRewardNotice, levelUpEvent, clearLevelUpEvent } = useQuests();

  const [charData, setCharData] = useState<CharacterResponse | null>(null);

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
      .catch(() => { /* silently fail for dashboard — attributes are supplementary */ });
    return () => { ignore = true; };
  }, []);

  // Use server attributes if available
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

      {/* Welcome Banner */}
      <div
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
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={12} /> Citadel Active Session
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome, Adventurer {user?.displayName || 'Hero'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '1rem', lineHeight: 1.5 }}>
            Your character session is securely verified with the server. Today&apos;s momentum awaits your command.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/app/character" className="rpg-btn rpg-btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            Character Sheet <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Metric 1: Level + XP Progress */}
        <div className="rpg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="rpg-label">Player Level</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#a855f7" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {level}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-xp)', fontWeight: 600 }}>
              {Math.round(xpPercent)}% to next
            </span>
          </div>
          {/* Mini XP progress bar */}
          <div className="rpg-progress-track" style={{ height: '4px', marginTop: '0.5rem' }}>
            <div
              className="rpg-progress-fill"
              style={{
                width: `${Math.max(2, Math.min(100, xpPercent))}%`,
                background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                transition: 'width 0.8s var(--ease-spring)',
              }}
            />
          </div>
        </div>

        {/* Metric 2: Total XP */}
        <div className="rpg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="rpg-label">Authoritative EXP</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#38bdf8" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {totalXp.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>XP</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
            Verified PostgreSQL record
          </p>
        </div>

        {/* Metric 3: Gold */}
        <div className="rpg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="rpg-label">Armory Gold</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 800, color: '#fef08a' }}>
              {gold.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>Coins</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
            Spendable in the Armory
          </p>
        </div>

        {/* Metric 4: Streak */}
        <div className="rpg-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="rpg-label">Momentum Streak</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#ef4444" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 800, color: '#fca5a5' }}>
              {streak}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-streak)' }}>Days</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
            Best: {character?.streakBest || 0} days
          </p>
        </div>
      </div>

      {/* Productivity & Accountability Analytics (Recreated from Reference Design) */}
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

        {/* Row 3: The Accountability Matrix */}
        <div className="analytics-row-3">
          <AccountabilityMatrix tasks={tasks} />
        </div>
      </div>

      {/* Disciplines Snapshot — Real Attribute Data */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Character Disciplines</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Server-authoritative attribute progression across the 5 core domains.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {attributes.map(attr => {
            const config = ATTR_CONFIG[attr.key.toLowerCase()] || {
              icon: Brain,
              color: 'var(--text-secondary)',
              focus: attr.displayName,
            };
            const Icon = config.icon;
            return (
              <div key={attr.key} className="rpg-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Icon size={18} color={config.color} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: config.color }}>
                    {attr.displayName}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{config.focus}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div className="rpg-progress-track" style={{ height: '6px', flex: 1 }}>
                    <div
                      className="rpg-progress-fill"
                      style={{
                        width: `${Math.min(100, attr.value * 5)}%`,
                        backgroundColor: config.color,
                        transition: 'width 0.6s var(--ease-spring)',
                      }}
                    />
                  </div>
                  <span
                    className="mono-numbers"
                    style={{ fontSize: '0.75rem', fontWeight: 700, color: config.color, minWidth: '24px', textAlign: 'right' }}
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
