import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import './admin-command-center.css';
import { AdminTopProgressBar } from './AdminTopProgressBar';
import { 
  Users, 
  Radio, 
  Inbox, 
  ShoppingBag, 
  LogOut, 
  ArrowLeft, 
  Crown, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export type AdminTab = 'users' | 'broadcasts' | 'feedback' | 'market';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
  isNavigating?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, onTabChange, children, isNavigating }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tab Button Refs for Floating Slider Pill
  const tabRefs = useRef<Record<AdminTab, HTMLButtonElement | null>>({
    users: null,
    broadcasts: null,
    feedback: null,
    market: null,
  });
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

  // Update sliding indicator position
  useEffect(() => {
    const updateSlider = () => {
      const activeBtn = tabRefs.current[currentTab];
      if (activeBtn) {
        setSliderStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          opacity: 1,
        });
      }
    };

    updateSlider();
    // Small timeout ensures rendered dimensions are measured accurately
    const timer = setTimeout(updateSlider, 40);
    window.addEventListener('resize', updateSlider);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSlider);
    };
  }, [currentTab]);

  // Close mobile menu on Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const tabs: { key: AdminTab; label: string; shortLabel: string; icon: React.ReactNode; iconClass: string }[] = [
    { key: 'users', label: 'Users & Economy', shortLabel: 'Users', icon: <Users size={18} />, iconClass: 'cmd-nav-icon-users' },
    { key: 'broadcasts', label: 'Broadcasts & 2X Surge', shortLabel: 'Surge', icon: <Radio size={18} />, iconClass: 'cmd-nav-icon-broadcast' },
    { key: 'feedback', label: 'Feedback Desk', shortLabel: 'Feedback', icon: <Inbox size={18} />, iconClass: 'cmd-nav-icon-feedback' },
    { key: 'market', label: 'Market Studio', shortLabel: 'Market', icon: <ShoppingBag size={18} />, iconClass: 'cmd-nav-icon-market' },
  ];

  const handleTabClick = (key: AdminTab) => {
    onTabChange(key);
    setIsMobileMenuOpen(false);
  };

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
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 clamp(0.75rem, 3vw, 1.5rem)',
        }}
      >
        <AdminTopProgressBar isNavigating={Boolean(isNavigating)} />

        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Left: Brand & Admin Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/achiever-logo.png"
              alt="Achiever Logo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)',
                border: '1px solid rgba(168, 85, 247, 0.5)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '1.15rem',
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
                    padding: '0.12rem 0.5rem',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(124, 58, 237, 0.35) 100%)',
                    border: '1px solid rgba(168, 85, 247, 0.6)',
                    color: '#d8b4fe',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Crown size={12} color="#d8b4fe" />
                  <span>Admin</span>
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }} className="hidden sm:block">
                {user?.email || 'Achiever_admin_4.com'}
              </div>
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop) */}
          <nav className="cmd-nav-menu-desktop" style={{ height: '100%', overflowX: 'auto' }}>
            {/* Sliding Active Pill Indicator */}
            {sliderStyle.width > 0 && (
              <div
                className="cmd-nav-slider-pill"
                style={{
                  transform: `translateX(${sliderStyle.left}px) translateY(-50%)`,
                  width: `${sliderStyle.width}px`,
                  opacity: sliderStyle.opacity,
                }}
              />
            )}

            {tabs.map((tab) => {
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  ref={(el) => { tabRefs.current[tab.key] = el; }}
                  type="button"
                  onClick={() => handleTabClick(tab.key)}
                  className={`cmd-nav-tab ${isActive ? 'active' : ''}`}
                >
                  <span className={`cmd-nav-icon ${tab.iconClass}`}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Link
              to="/app/dashboard"
              className="cmd-nav-back-btn"
            >
              <span className="cmd-nav-icon cmd-nav-icon-back"><ArrowLeft size={14} /></span>
              <span className="hidden sm:inline">Back to App</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="cmd-nav-signout-btn"
            >
              <span className="cmd-nav-icon cmd-nav-icon-signout"><LogOut size={14} /></span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="cmd-mobile-nav-toggle"
              aria-label={isMobileMenuOpen ? 'Close Profile Menu' : 'Open Profile Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Menu */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="cmd-mobile-drawer-overlay" 
              onClick={() => setIsMobileMenuOpen(false)} 
              aria-hidden="true" 
            />
            <div className="cmd-mobile-drawer" role="dialog" aria-label="Admin Profile and Destinations">
              <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Authenticated Admin
                </div>
                <div style={{ fontSize: '0.86rem', color: '#f8fafc', fontWeight: 600, marginTop: '0.2rem' }}>
                  {user?.displayName || 'Admin Operator'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  {user?.email || 'admin@achiever.internal'}
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                Quick Jump
              </div>
              {tabs.map((tab) => {
                const isActive = currentTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabClick(tab.key)}
                    className={`cmd-mobile-drawer-link ${isActive ? 'active' : ''}`}
                  >
                    <span className={`cmd-nav-icon ${tab.iconClass}`}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
                <Link
                  to="/app/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="cmd-nav-back-btn"
                  style={{ justifyContent: 'center', height: '44px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Player App</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="cmd-nav-signout-btn"
                  style={{ justifyContent: 'center', height: '44px' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of Citadel</span>
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content Area */}
      <main 
        className="cmd-main-content"
        style={{ 
          flex: 1, 
          padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)', 
          maxWidth: '1440px', 
          width: '100%', 
          margin: '0 auto', 
          boxSizing: 'border-box' 
        }}
      >
        {children}
      </main>

      {/* Footer (Hidden on mobile to save viewport height) */}
      <footer
        className="hidden sm:block"
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

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="cmd-mobile-bottom-nav" aria-label="Admin Navigation Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`cmd-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="cmd-bottom-nav-icon">{tab.icon}</span>
              <span className="cmd-bottom-nav-label">{tab.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

