import React from 'react';
import { LegalLayout } from './LegalLayout';
import { Swords } from 'lucide-react';

export const QuestsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Quest System"
      subtitle="Transform your daily tasks, habits, and learning goals into RPG-style quests that earn XP, gold, and attribute points."
      lastUpdated="September 2026"
      badgeText="QUEST ENGINE v2.4"
      icon={Swords}
    >
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          What Are Quests?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Quests are the core gameplay mechanic of Life RPG. Every real-world task you create becomes a quest — 
          complete it to earn <strong style={{ color: '#38bdf8' }}>XP</strong>, <strong style={{ color: '#fbbf24' }}>Gold</strong>, 
          and <strong style={{ color: '#c084fc' }}>Attribute Points</strong> that level up your character.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Whether it's finishing homework, going to the gym, reading a chapter, or learning a new skill — 
          every productive action counts toward your character's progression.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Quest Types
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            {
              name: 'Daily Quests',
              desc: 'Recurring tasks that reset each day. Build habits and maintain streaks for bonus rewards.',
              color: '#34d399',
            },
            {
              name: 'Side Quests',
              desc: 'One-time tasks for specific goals. Complete them at your own pace for XP and gold.',
              color: '#60a5fa',
            },
            {
              name: 'Epic Quests',
              desc: 'Major milestones and long-term goals. These award the highest XP and rare attribute boosts.',
              color: '#c084fc',
            },
            {
              name: 'Custom Quests',
              desc: 'Create your own quests with custom titles, descriptions, and difficulty ratings.',
              color: '#fbbf24',
            },
          ].map((quest) => (
            <div
              key={quest.name}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: quest.color }}>
                {quest.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                {quest.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Quest Difficulty & XP Scaling
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Difficulty</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>XP Range</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Gold Range</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Attribute Points</th>
              </tr>
            </thead>
            <tbody>
              {[
                { diff: 'Trivial', xp: '5–10 XP', gold: '1–3 Gold', attr: '—' },
                { diff: 'Easy', xp: '10–25 XP', gold: '3–8 Gold', attr: '+1' },
                { diff: 'Medium', xp: '25–50 XP', gold: '8–15 Gold', attr: '+1–2' },
                { diff: 'Hard', xp: '50–100 XP', gold: '15–30 Gold', attr: '+2–3' },
                { diff: 'Legendary', xp: '100–200 XP', gold: '30–75 Gold', attr: '+3–5' },
              ].map((row) => (
                <tr key={row.diff} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{row.diff}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{row.xp}</td>
                  <td style={{ padding: '0.75rem', color: '#fbbf24' }}>{row.gold}</td>
                  <td style={{ padding: '0.75rem', color: '#c084fc' }}>{row.attr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Streak System
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Complete quests on consecutive days to build a <strong style={{ color: '#f97316' }}>streak</strong>. 
          Streaks multiply your XP and gold rewards:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong style={{ color: '#f97316' }}>3-day streak:</strong> +10% bonus XP</li>
          <li><strong style={{ color: '#f97316' }}>7-day streak:</strong> +25% bonus XP + bonus Gold</li>
          <li><strong style={{ color: '#f97316' }}>14-day streak:</strong> +50% bonus XP + attribute boost</li>
          <li><strong style={{ color: '#f97316' }}>30-day streak:</strong> +100% bonus XP + rare rewards</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Quest Completion
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          When you mark a quest as complete, the server authoritatively calculates your rewards and updates your character. 
          All progression is <strong style={{ color: '#34d399' }}>persisted in our PostgreSQL database</strong> — 
          your progress is real, verified, and permanent.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Completed quests appear in your <strong>Chronicles & Activity Log</strong>, providing a tamper-proof 
          historical record of every quest you've conquered.
        </p>
      </section>
    </LegalLayout>
  );
};
