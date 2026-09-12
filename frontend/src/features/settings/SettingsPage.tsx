import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { 
  Settings as SettingsIcon, 
  Palette, 
  User, 
  LogOut, 
  Check, 
  Shield,
  Award,
  Zap,
  Coins
} from 'lucide-react';

const THEMES = [
  { key: 'default', name: 'Dark Citadel', desc: 'Midnight obsidian with sky-blue tactical HUD', border: '#38bdf8' },
  { key: 'neon_outpost', name: 'Neon Outpost', desc: 'Deep cyber-void with electric fuchsia and cyan accents', border: '#d946ef' },
  { key: 'mystic_forest', name: 'Mystic Forest', desc: 'Dark emerald grove with ancient glowing runes', border: '#10b981' },
  { key: 'solaris_gold', name: 'Solaris Gold', desc: 'Celestial warmth with golden amber and solar radiance', border: '#f59e0b' },
];

export const SettingsPage: React.FC = () => {
  useDocumentMetadata('Citadel Settings', { noindex: true });

  const { user, character, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTheme, setActiveTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'default';
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const applyTheme = (themeKey: string) => {
    setActiveTheme(themeKey);
    if (themeKey === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeKey);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SettingsIcon size={22} color="#38bdf8" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Citadel Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Configure your adventurer profile, cosmetics, and session preferences.
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="rpg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <User size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '1.15rem' }}>Adventurer Identity</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span className="rpg-label">Display Name</span>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              {user?.displayName || 'Adventurer'}
            </div>
          </div>

          <div>
            <span className="rpg-label">Account Email</span>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {user?.email || 'user@example.com'}
            </div>
          </div>

          <div>
            <span className="rpg-label">Hero Title / Bestowed Honor</span>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: (user?.title || character?.title) ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-sunken)',
                border: (user?.title || character?.title) ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: (user?.title || character?.title) ? '#fbbf24' : 'var(--text-secondary)',
                fontWeight: (user?.title || character?.title) ? 700 : 500,
              }}
            >
              <Award size={16} color={(user?.title || character?.title) ? '#fbbf24' : '#64748b'} />
              <span>{user?.title || character?.title || 'Novice Adventurer'}</span>
            </div>
          </div>

          <div>
            <span className="rpg-label">Citadel Economy & Progression</span>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.88rem' }}>
                <Zap size={14} color="#38bdf8" />
                Level {character?.level || 1} ({character?.totalXp || 0} XP)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>
                <Coins size={14} color="#fbbf24" />
                {character?.gold ?? 0} Coins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Theme Token Switcher */}
      <div className="rpg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Palette size={18} color="#a855f7" />
          <h2 style={{ fontSize: '1.15rem' }}>HUD Theme Customizer</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Live demonstration of the CSS Variable Token engine. In Phase 6, themes will be unlockable in the Armory.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {THEMES.map(theme => {
            const isSelected = activeTheme === theme.key;
            return (
              <button
                type="button"
                key={theme.key}
                onClick={() => applyTheme(theme.key)}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-sunken)',
                  border: isSelected ? `2px solid ${theme.border}` : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? `0 0 15px ${theme.border}35` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#ffffff' : 'var(--text-primary)' }}>
                    {theme.name}
                  </span>
                  {isSelected && <Check size={16} color={theme.border} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {theme.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Termination Card */}
      <div className="rpg-card" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Shield size={18} color="#ef4444" />
          <h2 style={{ fontSize: '1.15rem', color: '#fca5a5' }}>Session Management</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          End your active Citadel session. Your progression is safely stored in the PostgreSQL database.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rpg-btn rpg-btn-danger"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <LogOut size={16} />
          {isLoggingOut ? 'Invalidating Session...' : 'Sign Out of Life RPG'}
        </button>
      </div>
    </div>
  );
};
