import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useFeedback } from '../../context/FeedbackContext';
import { LogOut, User, Menu, X, MessageSquarePlus, Crown, ChevronDown } from 'lucide-react';

interface HeaderHUDProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const { openFeedback } = useFeedback();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
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
              className="rpg-btn rpg-btn-secondary hud-hamburger-btn"
              style={{ padding: '0.4rem', display: 'flex', border: 'none' }}
              aria-label={isSidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
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

        {/* Right: Admin Quick Link & Interactive Profile Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          {/* Interactive Profile Dropdown (housing Feedback & Sign Out) */}
          <div ref={menuRef} className="hud-profile-container" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              className={`hud-profile-btn ${isMenuOpen ? 'is-open' : ''}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-label="User Profile Menu"
            >
              <div className="hud-user-avatar">
                <User size={14} className="hud-user-icon" />
              </div>
              <span className="hud-user-name">
                {user?.displayName || 'Adventurer'}
              </span>
              <ChevronDown size={14} className={`hud-profile-chevron ${isMenuOpen ? 'is-open' : ''}`} />
            </button>

            {/* Glassmorphic Profile Dropdown Menu */}
            <div
              className={`hud-profile-dropdown ${isMenuOpen ? 'is-open' : ''}`}
              aria-label="Profile options"
            >
              {/* User Identity Header */}
              <div className="hud-dropdown-header">
                <div className="hud-dropdown-user-info">
                  <span className="hud-dropdown-title">Account Overview</span>
                  {user?.email && (
                    <span className="hud-dropdown-email">{user.email}</span>
                  )}
                </div>
              </div>

              <div className="hud-dropdown-divider" />

              {/* Feedback Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openFeedback();
                }}
                className="hud-dropdown-item hud-dropdown-feedback"
                aria-label="Send Feedback"
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
