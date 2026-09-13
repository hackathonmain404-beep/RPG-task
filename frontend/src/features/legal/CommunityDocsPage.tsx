import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import { 
  Users, 
  MessageSquare, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award
} from 'lucide-react';

export const CommunityDocsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Citadel Community"
      subtitle="Connect with fellow adventurers, participate in live community chat, climb the global leaderboards, and conquer realm challenges together."
      lastUpdated="September 2026"
      badgeText="CITADEL GUILD v2.4"
      icon={Users}
    >
      {/* 1. Introduction */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          The Adventurers Network
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '1rem', marginBottom: '1rem' }}>
          The Citadel is more than a solo task management system — it is a thriving, collective realm where real-world productivity is shared and celebrated. Whether you are studying for examinations, crushing fitness goals, building software, or mastering new habits, you are never adventuring alone.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '1rem' }}>
          Through our real-time social layer, adventurers can exchange encouragement, seek advice on quest optimization, display hard-earned prestige badges, and test their dedication on live global leaderboards.
        </p>
      </section>

      {/* 2. Core Pillars of the Community */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#38bdf8' }}>
          Community Systems & Features
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Card 1: Community Chat */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Live Community Chat
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              An ephemeral, high-speed live discussion lounge powered by Server-Sent Events (SSE). Messages sync across all online adventurers in under 50ms with zero page refresh required.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#34d399' }}>
              <Clock size={14} />
              <span>3-Day Automatic Privacy Retention Policy</span>
            </div>
          </div>

          {/* Card 2: Global Leaderboards */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Verified Leaderboards
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Live global rankings sorting authenticated players by Level, Experience (XP), and Citadel Gold. Features podium celebrations for top rankers with anti-cheat protection.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#fbbf24' }}>
              <Award size={14} />
              <span>100% Real Database Accounts &bull; Zero Bots</span>
            </div>
          </div>

          {/* Card 3: Surge Hours */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(192, 132, 252, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(192, 132, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Surge Hours & Raids
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, margin: 0 }}>
              Platform-wide surge periods where quest completions earn 1.5× to 2× bonus XP. Coordinated through real-time broadcast banners visible to all active adventurers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', fontSize: '0.8rem', color: '#c084fc' }}>
              <Sparkles size={14} />
              <span>Synchronized Realm-Wide Multipliers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real-Time Chat & Ephemeral Protocol */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Chat Protocol & Ephemeral Storage
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          To preserve privacy and maintain a fresh, clutter-free social space, the Citadel Community Chat operates on a strict <strong>72-hour ephemeral lifecycle</strong>:
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { title: 'Zero Long-Term Storage', desc: 'Chat messages are permanently purged by an automated background worker after 3 days. No archives are kept or sold.' },
            { title: 'Prestige Badges & Levels', desc: 'When you purchase a badge from the Armory (such as the Shadow Badge), it is pinned directly onto your avatar and name tag in chat.' },
            { title: 'Optimistic Instant Rendering', desc: 'Messages appear in your chat log with 0ms latency the instant you press Enter, then reconcile seamlessly with the backend database.' },
            { title: 'Markdown & Emojis', desc: 'Supports rich styling, code snippets, hyperlinks, and expressive emotes for seamless collaboration.' },
          ].map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '3px' }} />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{item.title}: </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>Ready to join the discussion?</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Log in to chat live with fellow adventurers right now.</div>
          </div>
          <Link
            to="/app/community-chat"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8',
              color: '#090C10',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span>Open Community Chat</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 4. Community Code of Conduct */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Adventurer Code of Conduct
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          All members of the Citadel realm must abide by the core principles of honor and mutual growth:
        </p>
        <div style={{ display: 'grid', gap: '0.85rem' }}>
          {[
            {
              rule: 'Constructive Encouragement',
              body: 'Celebrate achievements and offer helpful advice. We grow together by overcoming challenges collaboratively.',
            },
            {
              rule: 'Zero Tolerance for Harassment',
              body: 'Toxicity, hate speech, bullying, discrimination, and spam are strictly prohibited and result in permanent realm bans.',
            },
            {
              rule: 'Honest Quest Tracking',
              body: 'The Citadel honors genuine effort. Automating task completions with fake scripts degrades the spirit of self-improvement.',
            },
            {
              rule: 'Account & Identity Protection',
              body: 'Never share passwords or personal credentials in public chat channels. Citadel overseers will never ask for your password.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{item.rule}: </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.body}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </LegalLayout>
  );
};
