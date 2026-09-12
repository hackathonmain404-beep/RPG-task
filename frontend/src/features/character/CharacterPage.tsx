import { useAuth } from '../../context/useAuth';
import { 
  Flame, 
  Coins, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Heart, 
  User, 
  Award
} from 'lucide-react';

export const CharacterPage: React.FC = () => {
  const { user, character } = useAuth();

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streakCurrent = character?.streakCurrent || 0;
  const streakBest = character?.streakBest || 0;

  // 5 Canonical Attributes
  const attributes = [
    { key: 'intellect', name: 'Intellect', icon: Brain, color: 'var(--attr-intellect)', desc: 'Coding, logic, technical problem-solving', value: 12 },
    { key: 'strength', name: 'Strength', icon: Dumbbell, color: 'var(--attr-strength)', desc: 'Gym, physical conditioning, fitness', value: 10 },
    { key: 'wisdom', name: 'Wisdom', icon: BookOpen, color: 'var(--attr-wisdom)', desc: 'Reading, research, deep reflection', value: 14 },
    { key: 'charisma', name: 'Charisma', icon: Sparkles, color: 'var(--attr-charisma)', desc: 'Public speaking, teamwork, mentorship', value: 8 },
    { key: 'vitality', name: 'Vitality', icon: Heart, color: 'var(--attr-vitality)', desc: 'Sleep hygiene, nutrition, mindfulness', value: 11 },
  ];

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
        </div>
      </div>

      {/* Attributes & Disciplines */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Character Attributes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Progression across the 5 core human performance domains.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {attributes.map(attr => {
            const Icon = attr.icon;
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
                      backgroundColor: `${attr.color}18`,
                      border: `1px solid ${attr.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={attr.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: attr.color }}>{attr.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{attr.desc}</div>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="rpg-progress-track" style={{ height: '8px' }}>
                    <div
                      className="rpg-progress-fill"
                      style={{ width: `${Math.min(100, attr.value * 5)}%`, backgroundColor: attr.color }}
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
