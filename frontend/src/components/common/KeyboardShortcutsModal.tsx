import React, { useEffect } from 'react';
import { 
  Keyboard, 
  X, 
  LayoutDashboard, 
  Scroll, 
  UserCircle, 
  Store, 
  Palette, 
  Settings, 
  MessageSquarePlus, 
  PlusCircle, 
  Menu,
  Command
} from 'lucide-react';

interface ShortcutGroup {
  title: string;
  items: {
    keys: string[];
    description: string;
    icon?: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Citadel Navigation',
    items: [
      { keys: ['1'], description: 'Dashboard', icon: LayoutDashboard },
      { keys: ['2'], description: 'Quests & Bounties', icon: Scroll },
      { keys: ['3'], description: 'Character & Stats', icon: UserCircle },
      { keys: ['4'], description: 'Shop / Citadel Market', icon: Store },
      { keys: ['5'], description: 'Themes Marketplace', icon: Palette },
      { keys: ['6'], description: 'Settings & Identity', icon: Settings },
    ],
  },
  {
    title: 'Quick Actions & Commands',
    items: [
      { keys: ['N'], description: 'Create New Quest / Bounty', icon: PlusCircle },
      { keys: ['F'], description: 'Open Citadel Feedback Desk', icon: MessageSquarePlus },
      { keys: ['B'], description: 'Toggle Navigation Sidebar', icon: Menu },
      { keys: ['?'], description: 'Show Keyboard Shortcuts Help', icon: Keyboard },
      { keys: ['Esc'], description: 'Close Popups, Dialogs & Modals', icon: X },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0a0f1d',
          backgroundImage: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.98) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.2)',
          animation: 'modalPopIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          color: '#f8fafc',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Keyboard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
                Citadel Keyboard Shortcuts
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Tactical controls for lightning-fast adventurer navigation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.color = '#fca5a5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#94a3b8';
            }}
            aria-label="Close shortcuts dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {SHORTCUT_GROUPS.map(group => (
            <div key={group.title}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8', marginBottom: '0.75rem' }}>
                {group.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                {group.items.map(item => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.description}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {Icon && (
                          <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                            <Icon size={16} />
                          </div>
                        )}
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0' }}>
                          {item.description}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {item.keys.map(key => (
                          <kbd
                            key={key}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0 0.45rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono, monospace)',
                              color: '#38bdf8',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '6px',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                            }}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Command size={14} color="#38bdf8" />
            <span>Shortcuts work globally outside form inputs</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Press</span>
            <kbd
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.35rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '4px',
                color: '#f8fafc',
              }}
            >
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
