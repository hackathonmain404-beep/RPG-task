import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { characterApi, type CharacterResponse } from '../../services/api/character';
import type { Attribute } from '../../types/contract';
import { 
  Flame, 
  Coins, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Heart, 
  User, 
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Map attribute keys to their display configuration
const ATTRIBUTE_CONFIG: Record<string, { icon: React.FC<{ size?: number; color?: string }>; color: string; desc: string }> = {
  intellect: { icon: Brain, color: 'var(--attr-intellect)', desc: 'Coding, logic, technical problem-solving' },
  strength: { icon: Dumbbell, color: 'var(--attr-strength)', desc: 'Gym, physical conditioning, fitness' },
  wisdom: { icon: BookOpen, color: 'var(--attr-wisdom)', desc: 'Reading, research, deep reflection' },
  charisma: { icon: Sparkles, color: 'var(--attr-charisma)', desc: 'Public speaking, teamwork, mentorship' },
  vitality: { icon: Heart, color: 'var(--attr-vitality)', desc: 'Sleep hygiene, nutrition, mindfulness' },
};

// Default attributes shown when the server hasn't returned attribute data yet
const DEFAULT_ATTRIBUTES: Attribute[] = [
  { key: 'intellect', displayName: 'Intellect', value: 0 },
  { key: 'strength', displayName: 'Strength', value: 0 },
  { key: 'wisdom', displayName: 'Wisdom', value: 0 },
  { key: 'charisma', displayName: 'Charisma', value: 0 },
  { key: 'vitality', displayName: 'Vitality', value: 0 },
];

export const CharacterPage: React.FC = () => {
  const { user, character, xpProgress } = useAuth();
  const [charData, setCharData] = useState<CharacterResponse | null>(null);
  const [isLoadingChar, setIsLoadingChar] = useState(true);
  const [charError, setCharError] = useState<string | null>(null);

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streakCurrent = character?.streakCurrent || 0;
  const streakBest = character?.streakBest || 0;

  // Fetch full character data including attributes from GET /api/character
  useEffect(() => {
    let ignore = false;

    const fetchCharacter = async () => {
      setIsLoadingChar(true);
      setCharError(null);
      try {
        const data = await characterApi.getCharacter();
        if (!ignore) {
          setCharData(data);
        }
      } catch (err) {
        if (!ignore) {
          setCharError(err instanceof Error ? err.message : 'Failed to load character data.');
        }
      } finally {
        if (!ignore) {
          setIsLoadingChar(false);
        }
      }
    };

    void fetchCharacter();
    return () => { ignore = true; };
  }, []);

  // Use server attributes if available, otherwise show defaults
  const attributes: Attribute[] = charData?.attributes && charData.attributes.length > 0
    ? charData.attributes
    : (character?.attributes && character.attributes.length > 0)
      ? character.attributes
      : DEFAULT_ATTRIBUTES;

  // XP progress from server-authoritative data
  const xpPercent = xpProgress?.progressPercent ?? 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Profile Banner */}
      <div
        className="rpg-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.75rem',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
          border: '1px solid var(--border-strong)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid var(--border-focus)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
          }}
        >
          <User size={44} color="#38bdf8" />
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.75rem' }}>{user?.displayName || 'Adventurer'}</h1>
            <span className="rpg-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: 'var(--color-xp)' }}>
              Level {level}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {user?.email} · Citadel Verified Session
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-xp)' }}>
              <Sparkles size={16} />
              <span className="mono-numbers" style={{ fontWeight: 700 }}>{totalXp.toLocaleString()}</span> Total XP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)' }}>
              <Coins size={16} />
              <span className="mono-numbers" style={{ fontWeight: 700 }}>{gold.toLocaleString()}</span> Gold
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-streak)' }}>
              <Flame size={16} />
              <span className="mono-numbers" style={{ fontWeight: 700 }}>{streakCurrent}</span> Day Streak
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>Level {level} Progress</span>
              <span className="mono-numbers">{Math.round(xpPercent)}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={xpPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Level ${level} progress: ${Math.round(xpPercent)}%`}
              className="rpg-progress-track"
              style={{ height: '8px' }}
            >
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
        </div>
      </div>

      {/* Attributes & Disciplines */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Character Attributes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Server-authoritative progression across the 5 core human performance domains.
          </p>
        </div>

        {/* Loading State */}
        {isLoadingChar && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={22} className="animate-spin" color="#38bdf8" />
            <span>Fetching character attributes from server...</span>
          </div>
        )}

        {/* Error State */}
        {charError && !isLoadingChar && (
          <div
            className="rpg-card"
            style={{
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: '0.25rem' }}>
                Character Data Unavailable
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {charError}. Showing default attribute layout.
              </div>
            </div>
          </div>
        )}

        {/* Attribute List */}
        {!isLoadingChar && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {attributes.map(attr => {
              const config = ATTRIBUTE_CONFIG[attr.key.toLowerCase()] || {
                icon: Brain,
                color: 'var(--text-secondary)',
                desc: attr.displayName,
              };
              const Icon = config.icon;
              return (
                <div
                  key={attr.key}
                  className="rpg-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: `${config.color}18`,
                        border: `1px solid ${config.color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={20} color={config.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: config.color }}>
                        {attr.displayName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {config.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="rpg-progress-track" style={{ height: '8px' }}>
                      <div
                        className="rpg-progress-fill"
                        style={{
                          width: `${Math.min(100, attr.value * 5)}%`,
                          backgroundColor: config.color,
                          transition: 'width 0.6s var(--ease-spring)',
                        }}
                      />
                    </div>
                    <span className="mono-numbers" style={{ fontWeight: 700, minWidth: '40px', textAlign: 'right', fontSize: '0.9rem' }}>
                      Lvl {attr.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Relics & Badges Showcase */}
      <div className="rpg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <Award size={20} color="#f59e0b" />
          <h2 style={{ fontSize: '1.25rem' }}>Relics &amp; Badges</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Milestone honors unlocked through streak longevity, quest mastery, and discipline devotion.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'First Quest', desc: 'Forge your inaugural quest in the Citadel', unlocked: true },
            { title: 'Flame Keeper', desc: 'Maintain a 7-day momentum streak', unlocked: streakBest >= 7 },
            { title: 'Archmage of Code', desc: 'Attain Level 20 in Intellect', unlocked: false },
            { title: 'Century Scribe', desc: 'Complete 100 authenticated quests', unlocked: false },
          ].map(badge => (
            <div
              key={badge.title}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: badge.unlocked ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-elevated)',
                border: badge.unlocked ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                opacity: badge.unlocked ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: badge.unlocked ? '#fef08a' : 'var(--text-primary)' }}>
                  {badge.title}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: badge.unlocked ? '#f59e0b' : 'var(--text-tertiary)' }}>
                  {badge.unlocked ? 'CLAIMED' : 'LOCKED'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
