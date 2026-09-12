import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { 
  Users, 
  Radio, 
  Inbox, 
  ShoppingBag, 
  LogOut, 
  ArrowLeft, 
  Crown, 
  ShieldCheck
} from 'lucide-react';

export type AdminTab = 'users' | 'broadcasts' | 'feedback' | 'market';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'users', label: 'Users & Economy', icon: <Users size={16} /> },
    { key: 'broadcasts', label: 'Broadcasts & 2X Surge', icon: <Radio size={16} /> },
    { key: 'feedback', label: 'Feedback Desk', icon: <Inbox size={16} /> },
    { key: 'market', label: 'Market Studio', icon: <ShoppingBag size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Admin Horizontal Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
          }}
        >
          {/* Left: Brand & Admin Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/achiever-logo.png"
              alt="Achiever Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    letterSpacing: '0.03em',
                    color: '#ffffff',
                  }}
                >
                  Achiever
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(124, 58, 237, 0.35) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.6)',
                    color: '#d8b4fe',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Crown size={12} color="#d8b4fe" />
                  <span>Admin Panel</span>
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {user?.email || 'Achiever_admin_4.com'}
              </div>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '100%' }}>
            {tabs.map((tab) => {
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                    color: isActive ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/app/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to App</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={14} color="#38bdf8" />
          <span>CITADEL ROOT CONTROLLER // DATABASE CONNECTED // RESTRICTED ACCESS</span>
        </div>
      </footer>
    </div>
  );
};
