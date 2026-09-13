import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { AttributeCard } from './AttributeCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { 
  User, 
  Sparkles, 
  Flame, 
  Coins, 
  RotateCw, 
  AlertCircle, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export const CharacterPage: React.FC = () => {
  useDocumentMetadata('Character Sheet', { noindex: true });
  const { 
    user, 
    character, 
    xpProgress, 
    recentActivity, 
    lastAttributeChange, 
    refreshCharacter,
    isLoading: authLoading,
    serverReachable
  } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const level = character?.level ?? 1;
  const totalXp = character?.totalXp ?? 0;
  const gold = character?.gold ?? 0;
  const streakCurrent = character?.streakCurrent ?? 0;
  const streakBest = character?.streakBest ?? 0;
  const attributes = character?.attributes ?? [];

  // Server-authoritative XP progress percentage
  const xpPercent = Math.min(100, Math.max(0, Math.round(xpProgress?.progressPercent ?? ((totalXp % 500) / 500) * 100)));

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await refreshCharacter();
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Failed to synchronize character sheet with Citadel database.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Streak milestone indicator based on authoritative numbers
  const nextMilestone = streakCurrent < 7 ? 7 : streakCurrent < 14 ? 14 : streakCurrent < 30 ? 30 : 60;
  const daysToMilestone = Math.max(0, nextMilestone - streakCurrent);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Character Hero Header */}
      <header
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-strong)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar frame */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '16px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '2px solid var(--border-focus)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.25)',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Avatar'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <User size={40} color="#38bdf8" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {user?.displayName || 'Valiant Adventurer'}
              </h1>
              <span
                className="rpg-badge"
                style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: 'var(--color-xp)',
                  fontSize: '0.85rem',
                  padding: '0.2rem 0.6rem',
                  fontWeight: 800,
                }}
              >
                Level {level}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>{user?.email}</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--status-success)' }}>
                <ShieldCheck size={15} />
                Authoritative PostgreSQL Session
              </span>
            </div>
          </div>
        </div>

        {/* Sync / Refresh Action */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="rpg-button secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1rem',
            fontSize: '0.85rem',
          }}
          aria-label="Synchronize character data with server"
        >
          <RotateCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Sheet'}</span>
        </button>
      </header>

      {/* Recoverable Error Banner */}
      {(!serverReachable || refreshError) && (
        <div
          role="alert"
          className="rpg-card"
          style={{
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="var(--status-danger)" />
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5' }}>
                Citadel Synchronization Warning
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {refreshError || 'Unable to connect to live Citadel server. Character sheet reflects cached session.'}
              </div>
            </div>
          </div>
          <button
            onClick={handleManualRefresh}
            className="rpg-button secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Core Vitals Grid (Immediately Visible: LEVEL, XP, STREAK, GOLD) */}
      <section aria-label="Core Character Metrics">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Vitals Card 1: Level & XP Progression */}
          <div className="rpg-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-xp)' }}>
                <Sparkles size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Ascension Tier</span>
              </div>
              <span className="mono-numbers" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-xp)' }}>
                Lvl {level}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem' }}>
                <span>Level {level} Progress</span>
                <span className="mono-numbers">{xpPercent}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={xpPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Level ${level} experience progress: ${xpPercent}%`}
                className="rpg-progress-track"
                style={{ height: '10px' }}
              >
                <div
                  className="rpg-progress-fill"
                  style={{
                    width: `${Math.max(3, xpPercent)}%`,
                    background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Total Experience:</span>
              <span className="mono-numbers" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {totalXp.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Vitals Card 2: Streak System UI */}
          <div className="rpg-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-streak)' }}>
                <Flame size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Momentum Streak</span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--color-streak)',
                }}
              >
                Authoritative
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-streak)', lineHeight: 1 }}>
                🔥 {streakCurrent}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {streakCurrent === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Best Record: <strong className="mono-numbers" style={{ color: 'var(--text-primary)' }}>🔥 {streakBest} {streakBest === 1 ? 'Day' : 'Days'}</strong>
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                {daysToMilestone > 0 ? `${daysToMilestone}d to Tier ${nextMilestone}` : 'Milestone Achieved!'}
              </span>
            </div>
          </div>

          {/* Vitals Card 3: Citadel Gold & Wealth */}
          <div className="rpg-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)' }}>
                <Coins size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>Citadel Treasury</span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--color-gold)',
                }}
              >
                Economy
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="mono-numbers" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)', lineHeight: 1 }}>
                {gold.toLocaleString()}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Gold
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span>Armory Purchasing Power:</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Active Balance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Five Core Attributes Section */}
      <section aria-labelledby="attributes-heading">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 id="attributes-heading" style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Character Attributes
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              Five foundational human disciplines verified and synchronized with the Citadel RPG engine.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            <TrendingUp size={16} />
            <span>Increases awarded strictly by server completion responses</span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {authLoading && attributes.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map(idx => (
              <div key={idx} className="rpg-skeleton" style={{ height: '90px', borderRadius: '12px' }} />
            ))}
          </div>
        )}

        {/* 5 Attribute Cards */}
        {attributes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {attributes.map(attr => (
              <AttributeCard
                key={attr.key}
                attribute={attr}
                changeNotice={lastAttributeChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Recent Progression & Activity Section */}
      <section aria-label="Progression Activity History">
        <RecentActivityFeed
          activity={recentActivity}
          isLoading={authLoading}
        />
      </section>
    </div>
  );
};
