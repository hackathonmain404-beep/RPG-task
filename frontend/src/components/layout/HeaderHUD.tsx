import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Shield, Flame, Coins, LogOut, User, Menu, X } from 'lucide-react';

interface HeaderHUDProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, character, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const level = character?.level || 1;
  const totalXp = character?.totalXp || 0;
  const gold = character?.gold || 0;
  const streak = character?.streakCurrent || 0;

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Brand Logo & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="rpg-btn rpg-btn-secondary"
              style={{ padding: '0.4rem', display: 'flex', border: 'none' }}
              aria-label={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <Link
            to="/app/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
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
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.25)',
              }}
            >
              <Shield size={20} color="#38bdf8" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LIFE RPG
              </span>
            </div>
          </Link>
        </div>

        {/* Center: RPG Progression HUD (Desktop / Tablet) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
          className="hud-metrics-container"
        >
          {/* Level Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              boxShadow: 'var(--glow-xp)',
            }}
          >
            <span style={{ color: 'var(--color-xp)', fontWeight: 700, fontSize: '0.8rem' }}>LVL</span>
            <span className="mono-numbers" style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
              {level}
            </span>
          </div>

          {/* XP Bar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              minWidth: '130px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span style={{ fontWeight: 600 }}>EXP</span>
              <span className="mono-numbers" style={{ color: 'var(--color-xp)' }}>
                {totalXp.toLocaleString()} XP
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={totalXp}
              aria-valuemin={0}
              aria-label={`Player Level ${level} Experience`}
              className="rpg-progress-track"
              style={{ height: '6px' }}
            >
              <div
                className="rpg-progress-fill"
                style={{
                  width: `${Math.min(100, Math.max(10, (totalXp % 500) / 5))}%`,
                  background: 'linear-gradient(90deg, #a855f7, #c084fc)',
                }}
              />
            </div>
          </div>

          {/* Gold Wallet */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              boxShadow: 'var(--glow-gold)',
            }}
          >
            <Coins size={16} color="#f59e0b" />
            <span className="mono-numbers" style={{ fontWeight: 800, color: '#fef08a', fontSize: '0.95rem' }}>
              {gold.toLocaleString()}
            </span>
          </div>

          {/* Streak Flame */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: 'var(--glow-streak)',
            }}
          >
            <Flame size={16} color="#ef4444" />
            <span className="mono-numbers" style={{ fontWeight: 800, color: '#fca5a5', fontSize: '0.95rem' }}>
              {streak}d
            </span>
          </div>
        </div>

        {/* Right: Player Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={14} color="#38bdf8" />
            </div>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.displayName || 'Adventurer'}
            </span>
          </div>

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rpg-btn rpg-btn-danger"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            aria-label="Sign out of Life RPG"
          >
            <LogOut size={16} />
            <span className="desktop-only">{isLoggingOut ? 'Leaving...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
