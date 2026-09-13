import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, FileText, Eye, CheckCircle2, Swords, Gift, Users, Mail, Building2 } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  badgeText: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  badgeText,
  icon: Icon,
  children,
}) => {
  const location = useLocation();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const tabs = [
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Contact', path: '/contact', icon: Mail },
    { name: 'Citadel HQ', path: '/citadel-hq', icon: Building2 },
    { name: 'Quest System', path: '/quests', icon: Swords },
    { name: 'Reward Types', path: '/rewards', icon: Gift },
    { name: 'Privacy Policy', path: '/privacy', icon: Lock },
    { name: 'Terms of Service', path: '/terms', icon: FileText },
    { name: 'Accessibility', path: '/accessibility', icon: Eye },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(15, 20, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={20} color="#38bdf8" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                LIFE <span style={{ color: '#38bdf8' }}>RPG</span>
              </span>
            </Link>

            <span style={{ color: 'var(--border-strong)', fontSize: '0.9rem' }}>/</span>

            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Citadel Governance
            </span>
          </div>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Realm</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '3rem 1.5rem 5rem' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Hero Banner */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '1rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckCircle2 size={14} />
              <span>{badgeText}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={24} color="#38bdf8" />
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '2.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {title}
              </h1>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
              {subtitle}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>Effective: {lastUpdated}</span>
              <span>·</span>
              <span>Governing Jurisdiction: Citadel Core Realm</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <nav
            aria-label="Legal Documents"
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.75rem',
              overflowX: 'auto',
            }}
          >
            {tabs.map(tab => {
              const isActive = location.pathname === tab.path;
              const TabIcon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: isActive ? '#f8fafc' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <TabIcon size={16} color={isActive ? '#38bdf8' : 'currentColor'} />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Document Content Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '2.5rem',
              lineHeight: 1.75,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.75rem 1.5rem',
          backgroundColor: 'var(--bg-surface-sunken)',
          fontSize: '0.85rem',
          color: 'var(--text-tertiary)',
        }}
      >
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div>
            &copy; 2026 <strong>Life RPG</strong>. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Terms
            </Link>
            <span>·</span>
            <Link to="/accessibility" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
