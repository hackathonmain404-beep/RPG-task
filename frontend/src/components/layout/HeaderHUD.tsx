import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useShop } from '../../context/useShop';
import { useFeedback } from '../../context/FeedbackContext';
import { useLeaderboard } from '../../context/LeaderboardContext';
import { LogOut, User, Menu, X, MessageSquarePlus, Crown, ChevronDown, Award, Zap, Coins, Settings, Trophy } from 'lucide-react';

interface HeaderHUDProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, character, logout, isAdmin } = useAuth();
  const { inventory } = useShop();
  const { openFeedback } = useFeedback();
  const { openLeaderboard } = useLeaderboard();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Active badge: user.badge from backend or any owned badge from shop inventory
  const ownedBadgeItem = inventory?.find(
    (i) =>
      i.shopItem?.itemType === 'BADGE' ||
      (i.itemId || i.shopItemId)?.startsWith('badge_')
  );
  const activeBadge =
    user?.badge ||
    (ownedBadgeItem
      ? {
          id: ownedBadgeItem.id,
          name: ownedBadgeItem.shopItem?.name || 'Shadow Badge',
          icon: '/assets/items/badge_shadow.svg',
          sku: ownedBadgeItem.shopItem?.sku || 'badge_shadow',
        }
      : null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
        className="hud-header-inner"
        style={{
          width: '100%',
          padding: '0.75rem clamp(0.75rem, 2.5vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="hud-left-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="rpg-btn rpg-btn-secondary hud-hamburger-btn"
              style={{ padding: '0.45rem', display: 'flex', border: 'none', minWidth: '40px', minHeight: '40px', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle Navigation Sidebar (B)"
              title="Toggle Navigation Sidebar (B)"
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <Link
            to="/app/dashboard"
            className="hud-brand-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <img
              src="/achiever-logo.png"
              alt="Achiever Logo"
              className="hud-brand-logo"
            />
            <div>
              <span className="hud-brand-name">
                Achiever
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Feedback Button, Admin Quick Link & Interactive Profile Dropdown */}
        <div className="hud-right-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Leaderboard Trigger */}
          <button
            type="button"
            onClick={openLeaderboard}
            className="rpg-btn hud-leaderboard-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            aria-label="View Global Leaderboard"
            title="Global Rankings Leaderboard"
          >
            <Trophy size={16} color="#fbbf24" />
            <span className="desktop-only">Leaderboard</span>
          </button>
          {/* Feedback Trigger — immediately to the left of player profile */}
          <button
            type="button"
            onClick={openFeedback}
            className="rpg-btn hud-feedback-btn desktop-only-action"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#c084fc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            aria-label="Send Feedback"
          >
            <MessageSquarePlus size={16} />
            <span className="desktop-only">Feedback</span>
          </button>

          {/* Admin Control Center Quick Link — ONLY visible to verified admins */}
          {isAdmin && (
            <Link
              to="/admin"
              id="header-admin-link"
              title="Admin Control Center"
              className="hud-admin-quick-btn"
            >
              <Crown size={14} color="#c084fc" />
              <span className="desktop-only">Admin</span>
            </Link>
          )}

          {/* Interactive Profile Dropdown (housing Feedback & Sign Out) - Hidden on mobile, shifted into drawer */}
          <div ref={menuRef} className="hud-profile-container desktop-only-profile" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`hud-profile-btn ${isMenuOpen ? 'is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="User Profile Menu"
            >
              <div className="hud-user-avatar" style={{ overflow: 'hidden', position: 'relative' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || 'Profile'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <User size={14} className="hud-user-icon" />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.2 }}>
                <span className="hud-user-name" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>{user?.displayName || 'Adventurer'}</span>
                  {activeBadge && (
                    <img
                      src={activeBadge.icon || '/assets/items/badge_shadow.svg'}
                      alt={activeBadge.name}
                      title={`${activeBadge.name} (Badge)`}
                      style={{
                        width: '14px',
                        height: '14px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.7))',
                        verticalAlign: 'middle',
                      }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                </span>
                {(user?.title || character?.title) && (
                  <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 600, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Award size={10} color="#fbbf24" />
                    {user?.title || character?.title}
                  </span>
                )}
              </div>
              <ChevronDown size={14} className={`hud-profile-chevron ${isMenuOpen ? 'is-open' : ''}`} />
            </button>

            {/* Glassmorphic Profile Dropdown Menu */}
            <div
              className={`hud-profile-dropdown ${isMenuOpen ? 'is-open' : ''}`}
              aria-label="Profile options"
            >
              {/* User Identity Header */}
              <div className="hud-dropdown-header" style={{ padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName || 'Profile'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <User size={18} color="#38bdf8" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        Adventurer Profile
                      </div>
                      {user?.email && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>{user.email}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {activeBadge && (
                      <div
                        className="hud-profile-badge-emblem"
                        title={`${activeBadge.name} — Dedication Badge`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(88, 28, 135, 0.45))',
                          border: '1px solid rgba(168, 85, 247, 0.5)',
                          borderRadius: '12px',
                          boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)',
                        }}
                      >
                        <img
                          src={activeBadge.icon || '/assets/items/badge_shadow.svg'}
                          alt={activeBadge.name}
                          style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e9d5ff', letterSpacing: '0.02em' }}>
                          {activeBadge.name}
                        </span>
                      </div>
                    )}
                    {isAdmin && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#c084fc',
                        backgroundColor: 'rgba(168, 85, 247, 0.2)',
                        border: '1px solid rgba(168, 85, 247, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}>
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Bestowed Hero Title */}
                {(user?.title || character?.title) ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(168, 85, 247, 0.18))',
                      border: '1px solid rgba(245, 158, 11, 0.45)',
                      color: '#fbbf24',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                    }}
                  >
                    <Award size={14} color="#fbbf24" />
                    <span>{user?.title || character?.title}</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Award size={12} color="#64748b" />
                    <span>Novice Adventurer</span>
                  </div>
                )}

                {/* Level & Coins Stat Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.75rem',
                    marginTop: '0.15rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontWeight: 600 }}>
                    <Zap size={13} color="#38bdf8" />
                    Level {character?.level || 1} ({character?.totalXp || 0} XP)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24', fontWeight: 600 }}>
                    <Coins size={13} color="#fbbf24" />
                    {character?.gold ?? 0}
                  </span>
                </div>
              </div>

              <div className="hud-dropdown-divider" />

              {/* Account Settings */}
              <Link
                to="/app/settings"
                onClick={() => setIsMenuOpen(false)}
                className="hud-dropdown-item hud-dropdown-settings"
              >
                <Settings size={16} className="hud-item-icon" />
                <span>Account Settings</span>
              </Link>

              {/* Character Sheet */}
              <Link
                to="/app/character"
                onClick={() => setIsMenuOpen(false)}
                className="hud-dropdown-item hud-dropdown-character"
              >
                <User size={16} className="hud-item-icon" />
                <span>Character Sheet</span>
              </Link>

              {/* Leaderboard Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openLeaderboard();
                }}
                className="hud-dropdown-item"
                aria-label="Global Leaderboard"
              >
                <Trophy size={16} color="#fbbf24" className="hud-item-icon" />
                <span>Leaderboard</span>
              </button>

              {/* Feedback Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openFeedback();
                }}
                className="hud-dropdown-item hud-dropdown-feedback"
                aria-label="Give Feedback"
              >
                <MessageSquarePlus size={16} className="hud-item-icon" />
                <span>Feedback</span>
              </button>

              {/* Admin Link inside dropdown if verified admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="hud-dropdown-item hud-dropdown-admin"
                >
                  <Crown size={16} className="hud-item-icon" />
                  <span>Admin Control</span>
                </Link>
              )}

              <div className="hud-dropdown-divider" />

              {/* Sign Out Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="hud-dropdown-item hud-dropdown-signout"
                aria-label="Sign out of Achiever"
              >
                <LogOut size={16} className="hud-item-icon signout-icon" />
                <span>{isLoggingOut ? 'Leaving...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
