import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ThemeContext } from '../../context/themeContextDef';
import { applyThemeColors } from '../themes/applyTheme';
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
  Coins,
  Sparkles
} from 'lucide-react';

const PREGIVEN_HUD_THEMES = [
  { key: 'default', slug: 'dark-citadel', name: 'Dark Citadel', desc: 'Midnight obsidian with sky-blue tactical HUD', border: '#38bdf8' },
  { key: 'neon_outpost', slug: 'neon-outpost', name: 'Neon Outpost', desc: 'Deep cyber-void with electric fuchsia and cyan accents', border: '#06b6d4' },
  { key: 'mystic_forest', slug: 'mystic-forest', name: 'Mystic Forest', desc: 'Dark emerald grove with ancient glowing runes', border: '#10b981' },
  { key: 'solaris_gold', slug: 'solaris-gold', name: 'Solaris Gold', desc: 'Celestial warmth with golden amber and solar radiance', border: '#f59e0b' },
];

export const SettingsPage: React.FC = () => {
  useDocumentMetadata('Citadel Settings', { noindex: true });

  const { user, character, logout } = useAuth();
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEquippingKey, setIsEquippingKey] = useState<string | null>(null);

  const handleSelectTheme = async (themeDef: typeof PREGIVEN_HUD_THEMES[0]) => {
    setIsEquippingKey(themeDef.key);
    try {
      // 1. Immediately set data-theme attribute on document root & body
      document.documentElement.setAttribute('data-theme', themeDef.key);
      if (typeof document !== 'undefined' && document.body) {
        document.body.setAttribute('data-theme', themeDef.key);
      }

      // 2. Persist to local storage
      try {
        localStorage.setItem('liferpg_active_theme_id', themeDef.slug);
      } catch {
        // Ignore
      }

      // 3. Apply full design token CSS variables
      applyThemeColors(themeDef.slug);

      // 4. If ThemeContext is available, equip in context and Supabase/DB
      if (themeContext?.equipTheme) {
        const targetTheme = themeContext.themes.find(t => 
          t.slug === themeDef.slug || 
          t.slug === themeDef.key ||
          t.id === themeDef.slug || 
          t.name.toLowerCase() === themeDef.name.toLowerCase()
        );

        if (targetTheme) {
          await themeContext.equipTheme(targetTheme);
        }
      }

      // 5. Ensure data-theme remains themeDef.key for exact test contract match
      document.documentElement.setAttribute('data-theme', themeDef.key);
    } finally {
      setIsEquippingKey(null);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SettingsIcon size={22} color="#38bdf8" />
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', margin: 0 }}>Citadel Settings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.2rem 0 0' }}>
            Configure your adventurer profile, cosmetics, and session preferences.
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="rpg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <User size={18} color="#38bdf8" />
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>Adventurer Identity</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Display Name
              </label>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {user?.displayName || 'Adventurer'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Account Email
              </label>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all',
                }}
              >
                {user?.email || 'Unknown'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Hero Title / Bestowed Honor
              </label>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  color: '#34d399',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Award size={15} color="#34d399" />
                Novice Adventurer
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Citadel Economy & Progression
            </label>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface-sunken)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={18} color="#a855f7" />
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>HUD Theme Customizer</h2>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#34d399', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Sparkles size={12} />
            PRE-GIVEN STARTER THEMES
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Personalize your Life RPG dashboard and workstation. These starter themes are permanently unlocked and ready to equip.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
          {PREGIVEN_HUD_THEMES.map(theme => {
            const activeSlug = themeContext?.activeTheme?.slug || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null) || 'dark-citadel';
            const isSelected = 
              activeSlug === theme.slug ||
              activeSlug === theme.key ||
              (theme.key === 'default' && (activeSlug === 'dark-citadel' || activeSlug === 'default')) ||
              (theme.key === 'neon_outpost' && (activeSlug === 'neon-outpost' || activeSlug === 'neon_outpost')) ||
              (theme.key === 'mystic_forest' && (activeSlug === 'mystic-forest' || activeSlug === 'mystic_forest')) ||
              (theme.key === 'solaris_gold' && (activeSlug === 'solaris-gold' || activeSlug === 'solaris_gold'));

            const isProcessing = isEquippingKey === theme.key;

            return (
              <button
                type="button"
                key={theme.key}
                onClick={() => handleSelectTheme(theme)}
                disabled={isProcessing}
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
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#34d399' : 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                    {isSelected ? 'EQUIPPED' : 'READY TO EQUIP'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to="/app/themes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            <Palette size={15} />
            Explore All Themes in Citadel Theme Marketplace & Vault →
          </Link>
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
          style={{ padding: '0.65rem 1.25rem', minHeight: '44px' }}
        >
          <LogOut size={16} />
          <span>{isLoggingOut ? 'Invalidating Session...' : 'Sign Out of Life RPG'}</span>
        </button>
      </div>
    </div>
  );
};
