import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useQuests } from '../../context/useQuests';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { characterApi, type CharacterResponse } from '../../services/api/character';
import { RewardToast } from '../../components/common/RewardToast';
import { LevelUpOverlay } from '../../components/common/LevelUpOverlay';
import type { Attribute } from '../../types/contract';
import { 
  Shield, 
  Flame, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Heart,
  Scroll,
  Plus,
  Loader2,
  Check
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
  const { tasks, isLoading, pendingTaskIds, completeTask, lastRewardNotice, clearRewardNotice, levelUpEvent, clearLevelUpEvent } = useQuests();

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

      {/* Active Quests Preview */}
      <div className="rpg-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scroll size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Active Daily Trials</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                High-priority quests awaiting your conquest
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link
              to="/app/quests"
              className="rpg-btn rpg-btn-primary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Plus size={15} /> Add Quest
            </Link>
            <Link
              to="/app/quests"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#38bdf8',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View All Quests <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={22} className="animate-spin" color="#38bdf8" />
            <span>Consulting citadel task registry...</span>
          </div>
        ) : tasks.filter(t => !t.completed).length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: '12px',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={26} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>All Active Quests Slain!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.25rem' }}>
              Your task ledger is clear. Formulate new daily objectives to sustain your momentum and earn XP.
            </p>
            <Link to="/app/quests" className="rpg-btn rpg-btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              <Plus size={16} /> Formulate New Quest
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks
              .filter(t => !t.completed)
              .slice(0, 4)
              .map(task => {
                const isPending = pendingTaskIds.has(task.id);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.1rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      gap: '1rem',
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                      <button
                        type="button"
                        onClick={() => void completeTask(task.id)}
                        disabled={isPending}
                        aria-label={`Complete quest ${task.title}`}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: '2px solid rgba(56, 189, 248, 0.4)',
                          backgroundColor: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isPending ? 'not-allowed' : 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isPending ? (
                          <Loader2 size={13} className="animate-spin" color="#38bdf8" />
                        ) : (
                          <Check size={14} style={{ opacity: 0 }} />
                        )}
                      </button>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <span
                        className="rpg-badge"
                        style={{
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          textTransform: 'capitalize',
                          fontSize: '0.75rem',
                        }}
                      >
                        {task.categoryKey}
                      </span>
                      <span
                        className="rpg-badge"
                        style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.12)',
                          color: '#c084fc',
                          borderColor: 'rgba(168, 85, 247, 0.3)',
                          textTransform: 'capitalize',
                          fontSize: '0.75rem',
                        }}
                      >
                        {task.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Systems Status */}
      <div className="rpg-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Phase 1–3 Systems Online</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              App Shell, Authentication, Quest Engine &amp; RPG Progression Active
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#10b981' }}>
              ✅ Phase 3 RPG Progression
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Server-authoritative XP bar with real progression data</li>
              <li>Reward toast feedback on quest completion</li>
              <li>Level-up celebration overlay</li>
              <li>Real character attributes from <code>GET /api/character</code></li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#f59e0b' }}>
              ⏳ Upcoming Phase 4+
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Historical progression charts, streak heatmaps, shop/armory, and inventory system.
            </p>
            <Link
              to="/app/quests"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Conquer Quests Now <ArrowRight size={14} />
            </Link>
          </div>
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
