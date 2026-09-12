import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { characterApi, type HistoryItem } from '../../services/api/character';
import {
  Clock,
  Sparkles,
  Coins,
  TrendingUp,
  Flame,
  Award,
  Brain,
  Dumbbell,
  BookOpen,
  Heart,
  ChevronDown,
  Filter,
  CalendarDays,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<string, { icon: React.FC<{ size?: number; className?: string }>; label: string; color: string }> = {
  intellect: { icon: Brain, label: 'Intellect', color: '#38bdf8' },
  strength: { icon: Dumbbell, label: 'Strength', color: '#ef4444' },
  wisdom: { icon: BookOpen, label: 'Wisdom', color: '#a855f7' },
  charisma: { icon: Sparkles, label: 'Charisma', color: '#f59e0b' },
  vitality: { icon: Heart, label: 'Vitality', color: '#22c55e' },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#4ade80',
  medium: '#38bdf8',
  hard: '#f59e0b',
  epic: '#a855f7',
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByDate(items: HistoryItem[]): Record<string, HistoryItem[]> {
  const groups: Record<string, HistoryItem[]> = {};
  for (const item of items) {
    const dateKey = new Date(item.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  }
  return groups;
}

type FilterMode = 'all' | 'quest_completed' | 'level_up';

export const HistoryPage: React.FC = () => {
  useDocumentMetadata('Chronicles & Activity Log', { noindex: true });

  const { isGuest } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    let ignore = false;
    setIsLoading(true);
    characterApi.getHistory()
      .then(data => {
        if (!ignore) setHistory(data);
      })
      .catch(err => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load history');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => { ignore = true; };
  }, [isGuest]);

  const filtered = useMemo(() => {
    if (filter === 'all') return history;
    return history.filter(h => h.type === filter);
  }, [history, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // Summary stats
  const stats = useMemo(() => {
    const totalXp = history.reduce((sum, h) => sum + (h.xpGained || 0), 0);
    const totalGold = history.reduce((sum, h) => sum + (h.goldGained || 0), 0);
    const levelUps = history.filter(h => h.type === 'level_up').length;
    const topStreak = Math.max(0, ...history.map(h => h.streakCurrent || 0));
    return { totalXp, totalGold, levelUps, topStreak, totalEvents: history.length };
  }, [history]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            color: '#a855f7',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          <CalendarDays size={12} /> Tamper-Proof Log
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Chronicles & Activity Log</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          An immutable record of every completed quest, earned reward, and level milestone — sourced directly from the database.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div className="rpg-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#38bdf8" />
            <span className="rpg-label">Total XP Earned</span>
          </div>
          <span className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
            {stats.totalXp.toLocaleString()}
          </span>
        </div>
        <div className="rpg-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Coins size={16} color="#f59e0b" />
            <span className="rpg-label">Total Gold Earned</span>
          </div>
          <span className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fef08a' }}>
            {stats.totalGold.toLocaleString()}
          </span>
        </div>
        <div className="rpg-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={16} color="#a855f7" />
            <span className="rpg-label">Level-Ups</span>
          </div>
          <span className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>
            {stats.levelUps}
          </span>
        </div>
        <div className="rpg-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Flame size={16} color="#ef4444" />
            <span className="rpg-label">Peak Streak</span>
          </div>
          <span className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fca5a5' }}>
            {stats.topStreak}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: '#ffffff' }}>{filtered.length}</strong> of {history.length} events
        </span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="rpg-btn"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Filter size={14} />
            {filter === 'all' ? 'All Events' : filter === 'level_up' ? 'Level-Ups Only' : 'Quests Only'}
            <ChevronDown size={14} />
          </button>
          {showFilterMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: 'var(--surface-1, #1e1e2e)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '160px',
              }}
            >
              {(['all', 'quest_completed', 'level_up'] as FilterMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setFilter(mode); setShowFilterMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    textAlign: 'left',
                    background: filter === mode ? 'rgba(168,85,247,0.15)' : 'transparent',
                    color: filter === mode ? '#c084fc' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: filter === mode ? 700 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.background = filter === mode ? 'rgba(168,85,247,0.15)' : 'transparent'; }}
                >
                  {mode === 'all' ? 'All Events' : mode === 'level_up' ? 'Level-Ups Only' : 'Quests Only'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading / Error / Empty States */}
      {isLoading && (
        <div className="rpg-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="rpg-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading chronicles from the archive...</p>
        </div>
      )}

      {error && (
        <div className="rpg-card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <p style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Failed to load history</p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="rpg-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>
            {isGuest ? 'Guest Mode — No History' : 'No Events Yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isGuest
              ? 'Sign in with Google or GitHub to track your progression history.'
              : 'Complete quests to see your activity log here.'
            }
          </p>
        </div>
      )}

      {/* Grouped Timeline */}
      {!isLoading && !error && Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel}>
          {/* Date Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <CalendarDays size={16} color="var(--text-tertiary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {dateLabel}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span className="mono-numbers" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              {items.length} event{items.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Event Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map(item => {
              const catConfig = CATEGORY_CONFIG[item.categoryKey?.toLowerCase() || 'intellect'] || CATEGORY_CONFIG.intellect;
              const CatIcon = catConfig.icon;
              const isLevelUp = item.type === 'level_up';
              const diffColor = DIFFICULTY_COLORS[item.difficulty?.toLowerCase() || 'medium'] || '#38bdf8';

              return (
                <div
                  key={item.id}
                  className="rpg-card"
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderColor: isLevelUp ? 'rgba(168, 85, 247, 0.3)' : undefined,
                    background: isLevelUp
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)'
                      : undefined,
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: isLevelUp ? 'rgba(168, 85, 247, 0.15)' : `${catConfig.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isLevelUp
                      ? <Award size={20} color="#a855f7" />
                      : <CatIcon size={20} className="" />
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                        {item.title}
                      </span>
                      {isLevelUp && (
                        <span style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: 'rgba(168, 85, 247, 0.2)',
                          color: '#c084fc',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          Level Up! Lv{item.levelBefore} → Lv{item.levelAfter}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      {item.categoryKey && (
                        <span style={{ fontSize: '0.75rem', color: catConfig.color, fontWeight: 600 }}>
                          {catConfig.label}
                        </span>
                      )}
                      {item.difficulty && (
                        <span style={{ fontSize: '0.7rem', color: diffColor, fontWeight: 600, textTransform: 'capitalize' }}>
                          {item.difficulty}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', opacity: 0.7 }}>
                        {formatFullDate(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Rewards */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {(item.xpGained ?? 0) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={14} color="#38bdf8" />
                        <span className="mono-numbers" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                          +{item.xpGained}
                        </span>
                      </div>
                    )}
                    {(item.goldGained ?? 0) > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Coins size={14} color="#f59e0b" />
                        <span className="mono-numbers" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a' }}>
                          +{item.goldGained}
                        </span>
                      </div>
                    )}
                    {item.streakCurrent != null && item.streakCurrent > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Flame size={14} color="#ef4444" />
                        <span className="mono-numbers" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fca5a5' }}>
                          {item.streakCurrent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
