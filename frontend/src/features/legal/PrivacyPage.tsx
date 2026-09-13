import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { Lock, ShieldCheck, Database, KeyRound, UserX, BellRing } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useDocumentMetadata('Privacy Policy', {
    description: 'Learn how Life RPG safeguards adventurer data, protects OAuth profiles, and respects digital sovereignty.',
    noindex: false,
  });

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Our solemn oath on how your character records, progression telemetry, and personal identity are protected."
      lastUpdated="September 12, 2026"
      badgeText="WCAG & GDPR Compliant · Zero-Tracker Citadel"
      icon={Lock}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Section 1 */}
        <section>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <ShieldCheck size={22} color="#38bdf8" />
            1. The Adventurer Sovereignty Oath
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            In the Citadel of Life RPG, we hold digital privacy as an inviolable sanctuary. We do not sell, rent, or monetize
            your quest history, discipline points, productivity streaks, or personal identification. Your character’s triumphs,
            failures, and milestones belong exclusively to you.
          </p>
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            <strong style={{ color: '#38bdf8' }}>Guaranteed Zero Third-Party Trackers:</strong> Life RPG runs without tracking
            pixels, invasive telemetry brokers, behavioral advertising engines, or cross-site tracking fingerprints.
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <KeyRound size={22} color="#38bdf8" />
            2. OAuth & Authentication Identity Scopes
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            We utilize passwordless <strong>Supabase Native OAuth</strong> powered by industry-standard protocols (Google OAuth and GitHub OAuth).
            When you enter the Citadel:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Google Identity:</strong> We strictly request read-only access to your primary email address and public display name.
              We never access Google Drive, Gmail, Calendar, or Contacts.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>GitHub Identity:</strong> We strictly verify public profile metadata (username, public avatar URL, verified email).
              We never request read or write permissions to your private repositories, SSH keys, or organization assets.
            </li>
            <li>
              <strong>Tokens & Cryptographic Hashes:</strong> Your credentials never traverse or touch our custom servers directly.
              Sessions are negotiated via cryptographically signed JWT tokens issued by Supabase Auth and verified using HMAC/RSA keys.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Database size={22} color="#38bdf8" />
            3. What Data Is Stored in Citadel Archives
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            All persistent game state is isolated in our cloud PostgreSQL database via tenant-level user UUID partitioning:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0 0 0.5rem' }}>Character Telemetry</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Character level, total XP, current gold treasury, daily streaks, unlocked badges, and canonical attributes
                (Intellect, Strength, Wisdom, Charisma, Vitality).
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0 0 0.5rem' }}>Quest Records</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Titles, descriptions, difficulty tiers (Easy, Medium, Hard, Epic), due dates, and completion timestamps
                used exclusively to calculate progression rewards.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '0 0 0.5rem' }}>Armory Inventory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Equipped cosmetics, unlock timestamps, and theme preferences to personalize your HUD interface.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <BellRing size={22} color="#38bdf8" />
            4. Cookie Usage & Local Storage
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            We only use <strong>Strictly Essential Cookies</strong> and browser localStorage keys:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <code>sb-access-token</code> & <code>sb-refresh-token</code>: Secure, ephemeral session tokens verifying client identity.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <code>token</code> & <code>session</code>: <code>HttpOnly</code>, <code>SameSite=Lax</code> cookies safeguarding API calls against cross-site scripting (XSS).
            </li>
            <li>
              <code>theme-preference</code>: Local client preference saving your chosen UI theme preset.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <UserX size={22} color="#38bdf8" />
            5. Right to Erasure & Data Portability (GDPR/CCPA)
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Adventurers retain the unreserved right to inspect, export, or permanently delete their records from the Citadel.
            Initiating an account deletion permanently purges all linked quests, characters, completion events, and identity records
            from our PostgreSQL cluster with zero residual retention.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};
