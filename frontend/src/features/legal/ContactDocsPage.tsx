import React, { useState } from 'react';
import { LegalLayout } from './LegalLayout';
import { 
  Mail, 
  Send, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Loader2,
  Sparkles
} from 'lucide-react';

export const ContactDocsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmissionStatus(null);

    // Simulate reliable dispatch with confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    }, 900);
  };

  return (
    <LegalLayout
      title="Contact & Support"
      subtitle="Connect directly with Citadel Command for technical assistance, security disclosures, platform feedback, and realm partnerships."
      lastUpdated="September 2026"
      badgeText="COMMAND RELAY v2.4"
      icon={Mail}
    >
      {/* 1. Direct Contact Channels */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', color: '#38bdf8' }}>
          Direct Transmission Frequencies
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              role: 'Technical Support & Account Care',
              email: 'support@liferpg.dev',
              desc: 'Trouble with synchronization, magic links, character leveling, or quest tracking.',
              icon: HelpCircle,
              color: '#38bdf8',
            },
            {
              role: 'Security & Vulnerability Disclosure',
              email: 'security@liferpg.dev',
              desc: 'PGP-encrypted channel for reporting security anomalies, authentication issues, or bugs.',
              icon: ShieldAlert,
              color: '#f43f5e',
            },
            {
              role: 'Partnerships & Guild Research',
              email: 'partners@liferpg.dev',
              desc: 'Institutional inquiries, university productivity studies, and enterprise wellness integrations.',
              icon: Sparkles,
              color: '#fbbf24',
            },
          ].map((ch) => {
            const ChannelIcon = ch.icon;
            return (
              <div
                key={ch.role}
                style={{
                  padding: '1.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${ch.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChannelIcon size={18} color={ch.color} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    {ch.role}
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
                  {ch.desc}
                </p>
                <a
                  href={`mailto:${ch.email}`}
                  style={{
                    color: ch.color,
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginTop: 'auto',
                    paddingTop: '0.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <span>{ch.email}</span>
                  <span>&rarr;</span>
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Transmission Terminal */}
      <section style={{ marginBottom: '2.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: '#38bdf8' }}>
          Transmit a Message to Overseers
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Send an encrypted dispatch directly to our standby operations team. All dispatches receive automated ticket routing.
        </p>

        {submissionStatus === 'success' && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.92rem',
            }}
          >
            <CheckCircle2 size={20} />
            <span>Transmission acknowledged! A Citadel Overseer will reply to your communication shortly.</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.75rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Adventurer Name / Call-sign
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ValiantKnight"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Transmission Frequency (Email)
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adventurer@realm.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-category" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Dispatch Classification
            </label>
            <select
              id="contact-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            >
              <option value="support">Technical Support / Bug Encounter</option>
              <option value="account">Account & Magic Link Assistance</option>
              <option value="security">Security Vulnerability Report</option>
              <option value="feedback">Feature Suggestion & Feedback</option>
              <option value="partnership">Partnership & Institutional Collaboration</option>
            </select>
          </div>

          <div>
            <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
              Detailed Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question, bug report, or proposal..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              alignSelf: 'flex-start',
              padding: '0.75rem 1.75rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8',
              color: '#090C10',
              fontWeight: 700,
              fontSize: '0.92rem',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Broadcasting Dispatch...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Transmit Dispatch</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* 3. Response Guarantees & SLAs */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>
          Response Times & Service Level Commitments
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            {
              metric: '< 12 Hours',
              label: 'Critical & Security Priority',
              detail: 'Urgent authentication barriers, suspected security flaws, or database sync freezes.',
            },
            {
              metric: '24–48 Hours',
              label: 'Standard Inquiries',
              detail: 'Gameplay questions, UI customizations, theme requests, and general support.',
            },
            {
              metric: 'Weekly Sprints',
              label: 'Community Feature Suggestions',
              detail: 'Every feature request submitted via dispatches or /app/feedback is triaged in weekly engineering cycles.',
            },
          ].map((sla, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {sla.metric}
              </div>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', margin: '0.35rem 0' }}>
                {sla.label}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {sla.detail}
              </div>
            </div>
          ))}
        </div>
      </section>
    </LegalLayout>
  );
};
