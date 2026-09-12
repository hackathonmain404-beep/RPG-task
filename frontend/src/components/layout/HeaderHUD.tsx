import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useFeedback } from '../../context/FeedbackContext';
import { LogOut, User, Menu, X, MessageSquarePlus } from 'lucide-react';

interface HeaderHUDProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { openFeedback } = useFeedback();
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

        {/* Right: Feedback Button, Player Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Feedback Trigger — immediately to the left of user profile */}
          <button
            type="button"
            onClick={openFeedback}
            className="rpg-btn"
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
            }}
            aria-label="Send Feedback"
          >
            <MessageSquarePlus size={16} />
            <span className="desktop-only">Feedback</span>
          </button>
          <div
            className="hud-profile-btn"
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
              <User size={14} color="#38bdf8" className="hud-user-icon" />
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
            className="rpg-btn rpg-btn-danger hud-signout-btn"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            aria-label="Sign out of Achiever"
          >
            <LogOut size={16} className="signout-icon" />
            <span className="desktop-only">{isLoggingOut ? 'Leaving...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
