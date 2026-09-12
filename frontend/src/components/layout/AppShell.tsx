import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { HeaderHUD } from './HeaderHUD';
import { 
  LayoutDashboard, 
  Scroll, 
  UserCircle, 
  Store, 
  Package, 
  Settings,
  Sparkles
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/quests', label: 'Quests', icon: Scroll },
  { to: '/app/character', label: 'Character', icon: UserCircle },
  { to: '/app/shop', label: 'Shop', icon: Store },
  { to: '/app/inventory', label: 'Inventory', icon: Package },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Top HUD Bar */}
      <HeaderHUD onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Content Area with Sidebar */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Desktop Sidebar Navigation */}
        <aside
          style={{
            width: '240px',
            backgroundColor: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            flexShrink: 0,
          }}
          className="desktop-sidebar"
        >
          <div
            style={{
              padding: '0.5rem 0.75rem',
              marginBottom: '0.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
            }}
          >
            Citadel Navigation
          </div>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.15)' : 'none',
                  transition: 'all var(--duration-fast) ease',
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div
            style={{
              marginTop: 'auto',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Sparkles size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Phase 3 Active
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              RPG progression with server-authoritative XP, level-up celebrations, and reward feedback.
            </p>
          </div>
        </aside>

        {/* Mobile Drawer Overlay */}
        {isSidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{
              position: 'fixed',
              top: '57px',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 40,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '260px',
                height: '100%',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-strong)',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeSidebar}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {/* Main View Container */}
        <main
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            overflowY: 'auto',
            minHeight: 'calc(100vh - 65px)',
          }}
          className="app-main-content"
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (<768px) */}
      <nav
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 40,
        }}
        className="mobile-bottom-nav"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.2rem',
                textDecoration: 'none',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.35rem',
              })}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
