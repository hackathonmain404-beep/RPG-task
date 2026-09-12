import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Gift } from 'lucide-react';

export const RewardsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Rewards System"
      subtitle="Every quest you complete earns real, server-verified rewards — XP, Gold, Attribute Points, and Equipment."
      lastUpdated="September 2026"
      badgeText="REWARD ENGINE v2.4"
      icon={Gift}
    >
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#fbbf24' }}>
          Reward Types
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Life RPG features a multi-layered reward system designed to keep you motivated and progressing. 
          All rewards are calculated server-side and persisted in our database.
        </p>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            {
              name: 'Experience Points (XP)',
              desc: 'The primary progression currency. Earn XP from every quest to level up your character. Higher difficulty quests award more XP.',
              color: '#38bdf8',
              icon: '⚡',
            },
            {
              name: 'Gold',
              desc: 'The in-game currency earned from completing quests. Spend gold in the Armory to purchase equipment, consumables, and cosmetics.',
              color: '#fbbf24',
              icon: '🪙',
            },
            {
              name: 'Attribute Points',
              desc: 'Boost your five core attributes — Intellect, Strength, Wisdom, Charisma, and Vitality. Each quest rewards points based on its discipline category.',
              color: '#c084fc',
              icon: '📊',
            },
            {
              name: 'Streak Bonuses',
              desc: 'Maintain daily quest completion streaks for multiplied XP and gold rewards. Longer streaks unlock increasingly powerful bonuses.',
              color: '#f97316',
              icon: '🔥',
            },
          ].map((reward) => (
            <div
              key={reward.name}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{reward.icon}</span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: reward.color }}>
                  {reward.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                  {reward.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#fbbf24' }}>
          Five Core Attributes
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Your character grows across five distinct attributes. Each quest is tied to a discipline 
          that determines which attribute receives points:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Intellect', desc: 'Study, reading, and mental challenges', color: '#60a5fa', icon: '🧠' },
            { name: 'Strength', desc: 'Exercise, fitness, and physical activities', color: '#f87171', icon: '💪' },
            { name: 'Wisdom', desc: 'Reflection, meditation, and learning', color: '#a78bfa', icon: '📖' },
            { name: 'Charisma', desc: 'Social skills, communication, and networking', color: '#fb923c', icon: '✨' },
            { name: 'Vitality', desc: 'Health, nutrition, and self-care', color: '#34d399', icon: '❤️' },
          ].map((attr) => (
            <div
              key={attr.name}
              style={{
                padding: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{attr.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem', color: attr.color }}>
                {attr.name}
              </h3>
              <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.8rem' }}>
                {attr.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#fbbf24' }}>
          Level Progression
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          As you accumulate XP, you'll level up your character. Each level requires progressively more XP, 
          keeping the challenge engaging as you grow:
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>Level</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>XP Required</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>Cumulative XP</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>Unlock</th>
              </tr>
            </thead>
            <tbody>
              {[
                { level: '1 → 2', xp: '100 XP', cum: '100 XP', unlock: 'Quest Board' },
                { level: '2 → 3', xp: '150 XP', cum: '250 XP', unlock: 'Daily Streaks' },
                { level: '5 → 6', xp: '350 XP', cum: '1,250 XP', unlock: 'Armory Access' },
                { level: '10 → 11', xp: '750 XP', cum: '5,000 XP', unlock: 'Epic Quests' },
                { level: '20 → 21', xp: '1,500 XP', cum: '20,000 XP', unlock: 'Legendary Tier' },
              ].map((row) => (
                <tr key={row.level} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{row.level}</td>
                  <td style={{ padding: '0.75rem', color: '#38bdf8' }}>{row.xp}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{row.cum}</td>
                  <td style={{ padding: '0.75rem', color: '#34d399' }}>{row.unlock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#fbbf24' }}>
          Armory & Equipment
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Spend your hard-earned Gold in the <strong style={{ color: '#fbbf24' }}>Armory</strong> to purchase:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong style={{ color: '#60a5fa' }}>Weapons:</strong> Boost your quest completion effectiveness</li>
          <li><strong style={{ color: '#34d399' }}>Armor:</strong> Protect your streaks from breaking</li>
          <li><strong style={{ color: '#c084fc' }}>Accessories:</strong> Gain passive bonuses to attribute gains</li>
          <li><strong style={{ color: '#fbbf24' }}>Consumables:</strong> Temporary boosts to XP or gold multipliers</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#fbbf24' }}>
          Server-Verified Rewards
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          All rewards in Life RPG are <strong style={{ color: '#34d399' }}>calculated and verified server-side</strong>. 
          This means:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Rewards cannot be manipulated or spoofed from the client</li>
          <li>Every XP gain, gold transaction, and level-up is persisted in PostgreSQL</li>
          <li>Your progression history is fully auditable and tamper-proof</li>
          <li>Character state is always authoritative from the backend</li>
        </ul>
      </section>
    </LegalLayout>
  );
};
