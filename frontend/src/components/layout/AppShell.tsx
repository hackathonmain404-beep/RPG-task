import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { HeaderHUD } from './HeaderHUD';
import { 
  LayoutDashboard, 
  Scroll, 
  UserCircle, 
  Store, 
  Settings,
  Palette,
  Sparkles,
  MessageSquarePlus,
  X,
  ExternalLink,
  AlertTriangle,
  Info,
  PartyPopper,
  Flame,
  Keyboard
} from 'lucide-react';
import { FeedbackProvider, useFeedback } from '../../context/FeedbackContext';
import { FeedbackModal } from '../common/FeedbackModal.tsx';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAuth } from '../../context/useAuth';
import { ShopContext } from '../../context/shopContextDef';
import { QuestsContext } from '../../context/questsContextDef';
import { PageTransition } from '../common/PageTransition';
import { RouteLoadingBoundary } from '../common/RouteLoadingBoundary';
import { getActivePlatformBroadcast, getPlatformSurgeStatus } from '../../services/api/platform';
import { useSSE } from '../../hooks/useSSE';
import type { Broadcast } from '../../types/contract';
import '../../features/dashboard/dashboard-interactions.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, iconClass: 'icon-dashboard' },
  { to: '/app/quests', label: 'Quests', icon: Scroll, iconClass: 'icon-quests' },
  { to: '/app/character', label: 'Character', icon: UserCircle, iconClass: 'icon-character' },
  { to: '/app/shop', label: 'Shop', icon: Store, iconClass: 'icon-shop' },
  { to: '/app/themes', label: 'Themes', icon: Palette, iconClass: 'icon-themes' },
  { to: '/app/settings', label: 'Settings', icon: Settings, iconClass: 'icon-settings' },
];

const routePreloaders: Record<string, () => Promise<unknown>> = {
  '/app/dashboard': () => import('../../features/dashboard/DashboardPage'),
  '/app/quests': () => import('../../features/quests/QuestsPage'),
  '/app/character': () => import('../../features/character/CharacterPage'),
  '/app/shop': () => import('../../features/shop/ShopPage'),
  '/app/themes': () => import('../../features/themes/ThemeMarketplacePage'),
  '/app/inventory': () => import('../../features/inventory/InventoryPage'),
  '/app/settings': () => import('../../features/settings/SettingsPage'),
  '/app/feedback': () => import('../../features/feedback/FeedbackPage'),
};
const prefetchedRoutes = new Set<string>();

const prefetchRoute = (path: string) => {
  if (prefetchedRoutes.has(path)) return;
  const preloader = routePreloaders[path];
  if (preloader) {
    prefetchedRoutes.add(path);
    preloader().catch(() => {
      prefetchedRoutes.delete(path);
    });
  }
};

const AppShellInner: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('citadel_desktop_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { isFeedbackOpen, openFeedback, closeFeedback } = useFeedback();
  const { user, refreshCharacter } = useAuth();
  const shopContext = React.useContext(ShopContext);
  const questsContext = React.useContext(QuestsContext);
  const location = useLocation();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Store context handlers in refs to avoid re-triggering navigation sync on every state change
  const shopContextRef = React.useRef(shopContext);
  shopContextRef.current = shopContext;
  const questsContextRef = React.useRef(questsContext);
  questsContextRef.current = questsContext;
  const refreshCharacterRef = React.useRef(refreshCharacter);
  refreshCharacterRef.current = refreshCharacter;

  // Authoritative database synchronization when navigating between sections
  useEffect(() => {
    setPendingPath(null);
    if (!user) return;

    const path = location.pathname;
    if (path.includes('/shop')) {
      void shopContextRef.current?.loadShop();
      void shopContextRef.current?.loadInventory();
    } else if (path.includes('/quests')) {
      void questsContextRef.current?.loadTasks();
    } else if (path.includes('/character') || path.includes('/settings') || path.includes('/dashboard')) {
      void refreshCharacterRef.current();
    }
  }, [location.pathname, user?.id]);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsDesktopSidebarCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('citadel_desktop_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    } else {
      setIsSidebarOpen(prev => !prev);
    }
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Global Keyboard Shortcuts (1-7, N, F, B, ?, Esc)
  useKeyboardShortcuts({
    onToggleShortcutsModal: () => setIsShortcutsOpen(prev => !prev),
    onOpenFeedback: openFeedback,
    onToggleSidebar: toggleSidebar,
  });

  // Live Platform Telemetry
  const [activeBroadcast, setActiveBroadcast] = useState<Broadcast | null>(null);
  const [isBroadcastDismissed, setIsBroadcastDismissed] = useState<boolean>(false);
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadPlatformTelemetry = async () => {
      try {
        const [bRes, sRes] = await Promise.all([
          getActivePlatformBroadcast(),
          getPlatformSurgeStatus(),
        ]);
        if (!isMounted) return;

        if (bRes.broadcast && bRes.broadcast.active) {
          const dismissedId = sessionStorage.getItem('dismissed_broadcast_id');
          if (dismissedId !== bRes.broadcast.id) {
            setActiveBroadcast(bRes.broadcast);
            setIsBroadcastDismissed(false);
          }
        } else {
          setActiveBroadcast(null);
        }

        setIsSurgeActive(Boolean(sRes.surge?.active));
      } catch {
        // Fallback silently if offline
      }
    };

    void loadPlatformTelemetry();
    // Keep polling as fallback (longer interval since SSE is primary)
    const interval = setInterval(loadPlatformTelemetry, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // SSE real-time handlers (instant updates from admin actions)
  const sseHandlers = useMemo(() => ({
    'broadcast:update': (data: any) => {
      if (data.broadcast) {
        const dismissedId = sessionStorage.getItem('dismissed_broadcast_id');
        if (dismissedId !== data.broadcast.id) {
          setActiveBroadcast(data.broadcast);
          setIsBroadcastDismissed(false);
        }
      }
    },
    'broadcast:dismiss': () => {
      setActiveBroadcast(null);
    },
    'surge:update': (data: any) => {
      setIsSurgeActive(Boolean(data.surge?.active));
    },
  } as const), []);

  useSSE(sseHandlers);

  const handleDismissBroadcast = (id: string) => {
    sessionStorage.setItem('dismissed_broadcast_id', id);
    setIsBroadcastDismissed(true);
  };

  const getBroadcastColor = (type: string) => {
    switch (type) {
      case 'EVENT': return '#c084fc';
      case 'ALERT': return '#ef4444';
      case 'PARTY': return '#10b981';
      case 'INFO':
      default: return '#38bdf8';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-canvas)' }}>
      {/* 1. Global Platform Broadcast Top Bar */}
      {activeBroadcast && !isBroadcastDismissed && (
        <aside
          role="region"
          aria-label="Platform Announcement"
          style={{
            background: `linear-gradient(90deg, ${getBroadcastColor(activeBroadcast.type)}22 0%, rgba(15, 23, 42, 0.95) 50%, ${getBroadcastColor(activeBroadcast.type)}22 100%)`,
            borderBottom: `1px solid ${getBroadcastColor(activeBroadcast.type)}55`,
            color: '#f8fafc',
            padding: '0.45rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            zIndex: 60,
            fontSize: '0.85rem',
            boxShadow: `0 2px 16px ${getBroadcastColor(activeBroadcast.type)}25`,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
            <span style={{ color: getBroadcastColor(activeBroadcast.type), display: 'flex', alignItems: 'center' }}>
              {activeBroadcast.type === 'EVENT' && <Sparkles size={16} />}
              {activeBroadcast.type === 'ALERT' && <AlertTriangle size={16} />}
              {activeBroadcast.type === 'PARTY' && <PartyPopper size={16} />}
              {activeBroadcast.type === 'INFO' && <Info size={16} />}
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.72rem', color: getBroadcastColor(activeBroadcast.type), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              [{activeBroadcast.type}]
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {activeBroadcast.message}
            </span>
            {activeBroadcast.actionText && activeBroadcast.actionUrl && (
              <a
                href={activeBroadcast.actionUrl}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: getBroadcastColor(activeBroadcast.type),
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                <span>{activeBroadcast.actionText}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleDismissBroadcast(activeBroadcast.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            aria-label="Dismiss Broadcast"
          >
            <X size={15} />
          </button>
        </aside>
      )}

      {/* 2. Global 2X Surge Glowing Indicator Bar (if active) */}
      {isSurgeActive && (
        <aside
          role="region"
          aria-label="Surge Event Status"
          style={{
            background: 'linear-gradient(90deg, rgba(234, 88, 12, 0.25) 0%, rgba(249, 115, 22, 0.15) 100%)',
            borderBottom: '1px solid rgba(249, 115, 22, 0.4)',
            padding: '0.3rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#fed7aa',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            zIndex: 55,
          }}
        >
          <Flame size={14} color="#f97316" />
          <span>⚡ REALM SURGE ACTIVE: ALL QUEST REWARDS MULTIPLIED BY 2X</span>
        </aside>
      )}

      {/* Top HUD Bar */}
      <HeaderHUD onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Content Area with Sidebar */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Desktop Sidebar Navigation */}
        <aside
          style={{
            width: isDesktopSidebarCollapsed ? 0 : '240px',
            minWidth: isDesktopSidebarCollapsed ? 0 : '240px',
            backgroundColor: 'var(--bg-surface)',
            borderRight: isDesktopSidebarCollapsed ? 'none' : '1px solid var(--border-subtle)',
            padding: isDesktopSidebarCollapsed ? 0 : '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            flexShrink: 0,
            overflow: 'hidden',
            opacity: isDesktopSidebarCollapsed ? 0 : 1,
            pointerEvents: isDesktopSidebarCollapsed ? 'none' : 'auto',
            transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s ease, opacity 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          className={`desktop-sidebar anim-entrance-2 ${isDesktopSidebarCollapsed ? 'collapsed' : ''}`}
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
            const isPending = pendingPath === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                onClick={() => setPendingPath(item.to)}
                className={({ isActive }) => `sidebar-nav-item ${(isActive || isPending) ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={18} className={`nav-icon ${item.iconClass}`} />
                  <span className="nav-label-text">{item.label}</span>
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

          {/* Feedback Action Button in Left Sidebar */}
          <button
            type="button"
            onClick={openFeedback}
            onFocus={() => prefetchRoute('/app/feedback')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              width: '100%',
              padding: '0.7rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: isFeedbackOpen || location.pathname === '/app/feedback' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
              border: isFeedbackOpen || location.pathname === '/app/feedback' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
              color: isFeedbackOpen || location.pathname === '/app/feedback' ? '#c084fc' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--duration-fast) ease',
            }}
            onMouseEnter={e => {
              prefetchRoute('/app/feedback');
              if (!isFeedbackOpen && location.pathname !== '/app/feedback') {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.12)';
                e.currentTarget.style.color = '#c084fc';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
              }
            }}
            onMouseLeave={e => {
              if (!isFeedbackOpen && location.pathname !== '/app/feedback') {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
            aria-label="Open Feedback Modal"
          >
            <MessageSquarePlus size={18} />
            <span>Feedback</span>
          </button>

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--duration-fast) ease',
              marginTop: '0.25rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
              e.currentTarget.style.color = '#38bdf8';
              e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            aria-label="View Keyboard Shortcuts"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Keyboard size={18} />
              <span>Shortcuts</span>
            </div>
            <kbd
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.35rem',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '4px',
                color: '#38bdf8',
                fontWeight: 700,
              }}
            >
              ?
            </kbd>
          </button>
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
              zIndex: 90,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(280px, 85vw)',
                height: '100%',
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border-strong)',
                padding: '1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px)) 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                overflowY: 'auto',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
              }}
            >
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isPending = pendingPath === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      setPendingPath(item.to);
                      closeSidebar();
                    }}
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                    style={({ isActive }) => {
                      const active = isActive || isPending;
                      return {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: active ? '#ffffff' : 'var(--text-secondary)',
                        backgroundColor: active ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        border: active ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid transparent',
                        minHeight: '44px',
                      };
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}

              {/* Mobile Drawer Feedback Action Button */}
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  openFeedback();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#c084fc',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: '44px',
                }}
                aria-label="Open Feedback Modal"
              >
                <MessageSquarePlus size={18} />
                <span>Feedback</span>
              </button>
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
            position: 'relative',
          }}
          className="app-main-content"
        >
          <PageTransition>
            <RouteLoadingBoundary>
              <Outlet />
            </RouteLoadingBoundary>
          </PageTransition>
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
          padding: '0.4rem 0.25rem calc(0.4rem + env(safe-area-inset-bottom, 0px)) 0.25rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 80,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
        className="mobile-bottom-nav"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isPending = pendingPath === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onMouseEnter={() => prefetchRoute(item.to)}
              onFocus={() => prefetchRoute(item.to)}
              onClick={() => setPendingPath(item.to)}
              style={({ isActive }) => {
                const active = isActive || isPending;
                return {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.15rem',
                  textDecoration: 'none',
                  color: active ? '#38bdf8' : 'var(--text-secondary)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.35rem',
                  minWidth: '44px',
                  minHeight: '44px',
                  flexShrink: 0,
                };
              }}
            >
              <Icon size={18} />
              <span style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Global Unified Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={closeFeedback} />

      {/* Global Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};

export const AppShell: React.FC = () => {
  return (
    <FeedbackProvider>
      <AppShellInner />
    </FeedbackProvider>
  );
};
