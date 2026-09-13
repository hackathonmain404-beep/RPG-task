import React from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout } from './LegalLayout';
import { 
  Building2, 
  Cpu, 
  Database, 
  Server, 
  ArrowRight,
  Globe2,
  Lock
} from 'lucide-react';

export const CitadelHQDocsPage: React.FC = () => {
  return (
    <LegalLayout
      title="Citadel HQ & Platform Architecture"
      subtitle="The central hub, engineering philosophy, technology stack, and planetary infrastructure powering the Life RPG gamified operating system."
      lastUpdated="September 2026"
      badgeText="CITADEL MAINFRAME v2.4"
      icon={Building2}
    >
      {/* 1. The Citadel Mission */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          The Citadel Mission
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '1rem', marginBottom: '1rem' }}>
          Modern productivity tools are built like dry spreadsheets and corporate task queues. They treat human ambition like industrial inventory, demanding discipline while offering zero intrinsic delight or adventure.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '1rem' }}>
          <strong>Citadel HQ</strong> was founded to dismantle this paradigm. By uniting cognitive habit loops, narrative progression, and responsive game mechanics, we transform mundane everyday routines into an epic role-playing journey. Every finished task yields real XP; every consistent week earns character prestige, gold, and bestowed honors.
        </p>
      </section>

      {/* 2. Core Architectural Pillars */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#38bdf8' }}>
          Core Engineering Pillars
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Pillar 1: High-Performance Frontend */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={18} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                High-Performance Frontend
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
              Engineered with React 18, TypeScript, and Vite. Utilizes a custom CSS Variable Token engine for instantaneous 0ms dynamic theme switching, zero layout thrashing, and client-side HTML5 canvas avatar compression.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: 'auto', paddingTop: '0.5rem', fontWeight: 600 }}>
              &bull; 0ms Token Latency &bull; 60fps Glassmorphic UI
            </div>
          </div>

          {/* Pillar 2: Authoritative Database Engine */}
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={18} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Authoritative PostgreSQL Core
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
              Backed by Prisma ORM and robust relational database constraints. Every XP gain, coin balance, quest completion, and shop purchase is validated authoritatively server-side to prevent tampering or race conditions.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 'auto', paddingTop: '0.5rem', fontWeight: 600 }}>
              &bull; ACID Compliant &bull; Zero Simulated Dummy Data
            </div>
          </div>

          {/* Pillar 3: Real-Time Event Hub */}
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
                <Server size={18} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                SSE Real-Time Relay
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
              Single-connection Server-Sent Events (SSE) hub broadcasting live platform events, Surge hours, and Community Chat messages instantaneously without the polling overhead of traditional REST architectures.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: 'auto', paddingTop: '0.5rem', fontWeight: 600 }}>
              &bull; &lt; 50ms Global Broadcast Latency
            </div>
          </div>
        </div>
      </section>

      {/* 3. System Technology Specifications */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Citadel System Specifications
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Subsystem</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Technology Stack</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Operational Role</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sub: 'User Interface', tech: 'React 18 &bull; Vite &bull; Vanilla CSS Tokens', role: 'Reactive HUD, micro-animations, multi-palette theming' },
                { sub: 'API Server', tech: 'Node.js &bull; Express &bull; TypeScript', role: 'Authoritative gameplay engine, security validation' },
                { sub: 'Data Layer', tech: 'PostgreSQL &bull; Prisma ORM', role: 'Persistent storage for adventurers, quests, and economy' },
                { sub: 'Real-Time Sync', tech: 'Server-Sent Events (SSE Hub)', role: 'Zero-latency live chat, surge multipliers, telemetry' },
                { sub: 'Security Layer', tech: 'JWT &bull; Magic Links &bull; RBAC', role: 'Passwordless authentication, role-based protection' },
                { sub: 'Data Retention', tech: 'Cron Maintenance Workers', role: 'Automated 72-hour ephemeral chat purge engine' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem', color: '#f8fafc', fontWeight: 600 }}>{row.sub}</td>
                  <td style={{ padding: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{row.tech}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Planetary Presence & Data Sovereignty */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Data Sovereignty & HQ Operations
        </h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe2 size={16} color="#38bdf8" />
              <span>Headquarters Coordinates & Data Relays</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              Citadel HQ coordinates core operations from San Francisco, California, supported by distributed edge nodes throughout the Americas, Europe, and Asia-Pacific. All player data is stored strictly within secure, encrypted cloud data centers with automated point-in-time disaster recovery snapshots.
            </p>
          </div>

          <div style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color="#10b981" />
              <span>Player Data Sovereignty Guarantee</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              You own your adventure. Citadel HQ never sells, leases, or monetizes player productivity data to advertisers or third-party behavioral brokers. Adventurers hold full power to permanently purge their account and history at any time through our GitHub-style authenticated account deletion protocol.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(192, 132, 252, 0.1))', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>Experience the Citadel for yourself.</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Create your adventurer account and begin leveling up your real life.</div>
          </div>
          <Link
            to="/register"
            style={{
              padding: '0.65rem 1.35rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8',
              color: '#090C10',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span>Begin Your Adventure</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </LegalLayout>
  );
};
