import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { FileText, Award, Scale, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

export const TermsPage: React.FC = () => {
  useDocumentMetadata('Terms of Service', {
    description: 'Read the Citadel Adventurer Charter and terms governing usage, virtual progression, and fair play in Life RPG.',
    noindex: false,
  });

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The sacred Citadel Charter governing fair play, digital progression, and covenant between adventurer and realm."
      lastUpdated="September 12, 2026"
      badgeText="Citadel Charter v2.4 · Fair-Play Enforced"
      icon={FileText}
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
            <Scale size={22} color="#38bdf8" />
            1. Acceptance of the Charter
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            By registering, authenticating via Google or GitHub OAuth, creating a character, or logging quests within Life RPG
            (the &quot;Citadel&quot;), you agree to be bound by this Adventurer Charter. If you do not agree to these terms,
            you must refrain from entering the realm and utilizing its progression services.
          </p>
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
            <ShieldAlert size={22} color="#38bdf8" />
            2. Server-Authoritative Fair Play & Anti-Tampering
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            Life RPG is built upon genuine personal growth, real-world productivity, and transparent gamification. To preserve
            the competitive integrity of the leaderboards and hall of champions:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', margin: '0 0 1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Zero Tolerance for Client Tampering:</strong> All calculations of Experience Points (XP), Gold drops,
              Daily Streaks, and Attribute boosts are strictly calculated and awarded by the backend API.
              Payload forgery, artificial timestamp manipulation, or automated API spamming constitutes a violation of the charter.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Sequential Replay Prevention:</strong> Concurrency safeguards and idempotent transactions strictly prohibit
              duplicate task completion exploitation or artificial race conditions.
            </li>
            <li>
              <strong>Audit Enforcement:</strong> Any accounts found utilizing unauthorized bots, scripts, or network spoofing to falsify
              progression will face immediate forfeiture of titles and permanent banishment.
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
            <Sparkles size={22} color="#38bdf8" />
            3. Digital Currency & Virtual Goods (Armory)
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            All in-game currency (<strong>Gold</strong>), inventory items, badges, titles, and cosmetic interface themes are strictly
            non-monetary, digital gamification tokens.
          </p>
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '8px',
              padding: '1.25rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong style={{ color: '#f59e0b' }}>Important Financial Disclaimer:</strong>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
              Citadel Gold cannot be redeemed for fiat currency, cryptocurrency, legal tender, real-world goods, or cash refunds.
              Gold and cosmetics cannot be traded, sold, or transferred to other players outside the Citadel platform.
            </p>
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
            <Award size={22} color="#38bdf8" />
            4. Account Custody & Security
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Adventurers are responsible for maintaining the security of the third-party OAuth providers (Google and GitHub) linked
            to their character. Any actions taken, quests completed, or items acquired through an authenticated session will be
            deemed authoritative. You agree to notify Citadel guardians immediately if you detect unauthorized access to your account.
          </p>
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
            <AlertTriangle size={22} color="#38bdf8" />
            5. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            The Citadel application and services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis.
            While we engineer redundant database backups and resilient serverless architectures, we disclaim all warranties,
            express or implied, regarding continuous uptime, data loss resulting from third-party provider downtime, or software defects.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};
