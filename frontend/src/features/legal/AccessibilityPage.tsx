import React from 'react';
import { LegalLayout } from './LegalLayout';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { Eye, Keyboard, Sparkles, Contrast, Volume2, HelpCircle } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  useDocumentMetadata('Accessibility Statement', {
    description: 'Life RPG commitment to WCAG 2.1 AA accessibility, keyboard navigation matrix, and inclusive gamification.',
    noindex: false,
  });

  const keyboardMatrix = [
    { key: 'Tab / Shift+Tab', action: 'Sequential Navigation', description: 'Moves keyboard focus forward/backward across interactive buttons, inputs, and quest controls.' },
    { key: 'Enter / Space', action: 'Activate / Complete', description: 'Triggers buttons, confirms dialogs, and checks off quests in the quest log.' },
    { key: 'Escape', action: 'Dismiss Overlays', description: 'Immediately closes active modals, celebration dialogs, and drawer sheets, restoring focus.' },
    { key: 'Arrow Left / Right', action: 'Tabs & Segments', description: 'Navigates between Armory categories and quest difficulty segments (Easy, Medium, Hard, Epic).' },
    { key: 'N', action: 'Quick Quest Composer', description: 'Global dashboard shortcut to summon the new quest modal without touching the mouse.' },
  ];

  return (
    <LegalLayout
      title="Accessibility Statement"
      subtitle="Gamification must never exclude. We engineer every quest, reward celebration, and HUD indicator for all adventurers."
      lastUpdated="September 12, 2026"
      badgeText="WCAG 2.1 Level AA · 100% Keyboard Operable"
      icon={Eye}
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
            <Sparkles size={22} color="#38bdf8" />
            1. Our Commitment to Universal Access
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            Life RPG is dedicated to ensuring digital accessibility for people with diverse abilities. We continually improve
            the user experience for everyone and apply the relevant accessibility standards under the <strong>Web Content Accessibility
            Guidelines (WCAG) 2.1 Level AA</strong>.
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Every interaction available to mouse or touch users has a 100% equivalent implementation for keyboard-only navigators,
            screen readers, and users with motion sensitivities.
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
            <Keyboard size={22} color="#38bdf8" />
            2. Keyboard Navigation Matrix
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            The Citadel can be navigated entirely without a mouse. The table below outlines canonical shortcuts:
          </p>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 600 }}>Keystroke</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 600 }}>Behavior Description</th>
                </tr>
              </thead>
              <tbody>
                {keyboardMatrix.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: idx === keyboardMatrix.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                      <kbd
                        style={{
                          backgroundColor: '#060913',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '0.15rem 0.45rem',
                          fontSize: '0.8rem',
                        }}
                      >
                        {item.key}
                      </kbd>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {item.action}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <Contrast size={22} color="#38bdf8" />
            3. High-Contrast Focus Ring & Color Contrast
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
            We mandate visible, high-contrast focus rings for all interactive elements:
          </p>
          <div
            style={{
              backgroundColor: '#06080b',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: '#38bdf8',
              marginBottom: '1rem',
            }}
          >
            :focus-visible &#123; outline: 2px solid #38bdf8; outline-offset: 2px; box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.25); &#125;
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Every body text element complies with WCAG 2.1 AA minimum <strong>4.5:1</strong> contrast ratio, and large headings
            satisfy at least <strong>3.0:1</strong> contrast against our dark canvas themes.
          </p>
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
            <Volume2 size={22} color="#38bdf8" />
            4. Screen Reader Semantics & Reduced Motion
          </h2>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', margin: 0 }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>ARIA Live Regions:</strong> Level-up celebrations and attribute reward notifications announce changes
              via <code>aria-live=&quot;polite&quot;</code> and <code>role=&quot;status&quot;</code> without abruptly interrupting speech.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>Progress Bars:</strong> Character XP gauges and attribute meters expose <code>role=&quot;progressbar&quot;</code> with accurate <code>aria-valuenow</code>, <code>aria-valuemin</code>, and <code>aria-valuemax</code>.
            </li>
            <li>
              <strong>Prefers-Reduced-Motion:</strong> For adventurers with vestibular disorders, all particle bursts, floating coin animations,
              and modal bounces respect system-level <code>prefers-reduced-motion: reduce</code> settings by substituting immediate transitions.
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
            <HelpCircle size={22} color="#38bdf8" />
            5. Feedback & Support
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            If you encounter any barrier preventing you from questing, leveling up, or accessing Citadel features, please report it
            to our accessibility team. We welcome your feedback and prioritize barrier removal in our regular release cycle.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
};
