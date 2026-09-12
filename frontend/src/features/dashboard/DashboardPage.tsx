import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
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
  Heart 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, character } = useAuth();

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streak = character?.streakCurrent || 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
        {/* Metric 1: Level */}
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
            <span style={{ fontSize: '0.85rem', color: 'var(--color-xp)', fontWeight: 600 }}>Rank I</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
            Next ascension at {(level * 100).toLocaleString()} XP
          </p>
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

      {/* Phase 1 Completion & Roadmap Status */}
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
            <h2 style={{ fontSize: '1.25rem' }}>Phase 1 Foundation Complete</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              App Shell, Authentic Auth Session &amp; Navigation Ready
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
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#38bdf8' }}>
              ✅ Active Systems
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>React 18 + TypeScript + Vite architecture</li>
              <li>Authoritative session auth via <code>/api/auth/me</code></li>
              <li>Responsive Header HUD with Level, XP, Gold, Streak</li>
              <li>Zero fake client persistence; server-driven truth</li>
            </ul>
          </div>

          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: '#f59e0b' }}>
              ⏳ Upcoming Phase 2 (Quest CRUD)
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Task creation, editing, category discipline mapping, and atomic completion transactions will be connected in Phase 2.
            </p>
            <Link
              to="/app/quests"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
            >
              Inspect Quest Roadmap <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Disciplines Snapshot */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Character Disciplines</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Completing quests in Phase 2 will allocate attribute gains to these 5 domains.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { key: 'intellect', label: 'Intellect', icon: Brain, color: 'var(--attr-intellect)', focus: 'Technical & Logic' },
            { key: 'strength', label: 'Strength', icon: Dumbbell, color: 'var(--attr-strength)', focus: 'Physical Fitness' },
            { key: 'wisdom', label: 'Wisdom', icon: BookOpen, color: 'var(--attr-wisdom)', focus: 'Study & Reading' },
            { key: 'charisma', label: 'Charisma', icon: Sparkles, color: 'var(--attr-charisma)', focus: 'Social & Team' },
            { key: 'vitality', label: 'Vitality', icon: Heart, color: 'var(--attr-vitality)', focus: 'Sleep & Health' },
          ].map(d => {
            const Icon = d.icon;
            return (
              <div key={d.key} className="rpg-card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Icon size={18} color={d.color} />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: d.color }}>{d.label}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.focus}</div>
                <div style={{ marginTop: '0.75rem', height: '6px' }} className="rpg-progress-track">
                  <div className="rpg-progress-fill" style={{ width: '20%', backgroundColor: d.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
