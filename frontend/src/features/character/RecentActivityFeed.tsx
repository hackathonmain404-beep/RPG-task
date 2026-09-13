import React from 'react';
import type { ProgressionActivityItem } from '../../context/authContextDef';
import { CheckCircle2, Sparkles, Coins, ArrowUpRight, Flame, History } from 'lucide-react';

interface RecentActivityFeedProps {
  activity: ProgressionActivityItem[];
  isLoading?: boolean;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activity, isLoading = false }) => {
  return (
    <div className="rpg-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <History size={20} color="var(--color-xp)" />
          <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Progression &amp; Activity Log</h2>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Authoritative Server Events
        </span>
      </div>

      {isLoading && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading progression records...
        </div>
      )}

      {!isLoading && activity.length === 0 && (
        <div
          style={{
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-sunken)',
            borderRadius: '8px',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <History size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Progression Records Yet
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
            Complete quests on your quest board to forge authoritative XP, Gold, streak milestones, and attribute ascension records.
          </p>
        </div>
      )}

      {!isLoading && activity.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activity.map(item => {
            const isLevelUp = item.type === 'level_up';
            const formattedDate = new Date(item.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: isLevelUp ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-surface-elevated)',
                  border: isLevelUp ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid var(--border-subtle)',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Left Side: Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 'min(100%, 200px)', flex: 1 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isLevelUp ? 'rgba(168, 85, 247, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      border: isLevelUp ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isLevelUp ? (
                      <ArrowUpRight size={18} color="var(--color-xp)" />
                    ) : (
                      <CheckCircle2 size={18} color="var(--status-success)" />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      {isLevelUp && (
                        <span
                          className="rpg-badge"
                          style={{
                            backgroundColor: 'rgba(168, 85, 247, 0.25)',
                            color: 'var(--color-xp)',
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.4rem',
                          }}
                        >
                          Level Up {item.levelAfter ? `(${item.levelAfter})` : ''}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {formattedDate} · Verified Server Event
                    </span>
                  </div>
                </div>

                {/* Right Side: Authoritative Reward Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {item.xpGained !== undefined && item.xpGained > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-xp)',
                        backgroundColor: 'rgba(168, 85, 247, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      <Sparkles size={12} />
                      +{item.xpGained} XP
                    </span>
                  )}

                  {item.goldGained !== undefined && item.goldGained > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-gold)',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      <Coins size={12} />
                      +{item.goldGained} Gold
                    </span>
                  )}

                  {item.attributeGained && item.attributeGained.amount > 0 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--border-focus)',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                      }}
                    >
                      +{item.attributeGained.amount} {item.attributeGained.key}
                    </span>
                  )}

                  {item.streakCurrent !== undefined && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-streak)',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      <Flame size={12} />
                      {item.streakCurrent}d
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
