import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseKeyboardShortcutsOptions {
  onToggleShortcutsModal: () => void;
  onOpenFeedback: () => void;
  onToggleSidebar: () => void;
}

export function useKeyboardShortcuts({
  onToggleShortcutsModal,
  onOpenFeedback,
  onToggleSidebar,
}: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl && (activeEl as HTMLElement).isContentEditable);

      // Never intercept inside text inputs unless it's Escape
      if (isInputActive) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      // Ignore if modifier keys like Ctrl, Alt, Meta are held for regular letters,
      // but allow Shift for ?
      if (e.ctrlKey || e.metaKey) return;

      const key = e.key;

      // 1. Show Keyboard Shortcuts Modal ('?' or '/')
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        onToggleShortcutsModal();
        return;
      }

      // 2. Citadel Navigation (1-7)
      if (key === '1') {
        e.preventDefault();
        navigate('/app/dashboard');
        return;
      }
      if (key === '2') {
        e.preventDefault();
        navigate('/app/quests');
        return;
      }
      if (key === '3') {
        e.preventDefault();
        navigate('/app/character');
        return;
      }
      if (key === '4') {
        e.preventDefault();
        navigate('/app/shop');
        return;
      }
      if (key === '5') {
        e.preventDefault();
        navigate('/app/themes');
        return;
      }
      if (key === '6') {
        e.preventDefault();
        navigate('/app/settings');
        return;
      }

      // 3. Quick Actions
      // 'N' or 'n' -> New Quest / Bounties
      if (key === 'n' || key === 'N') {
        e.preventDefault();
        if (location.pathname !== '/app/quests') {
          navigate('/app/quests?action=new');
        } else {
          // Fire event to open quest composer
          window.dispatchEvent(new CustomEvent('liferpg-open-quest-composer'));
        }
        return;
      }

      // 'F' or 'f' -> Feedback Desk
      if (key === 'f' || key === 'F') {
        e.preventDefault();
        onOpenFeedback();
        return;
      }

      // 'B' or 'b' -> Toggle Sidebar
      if (key === 'b' || key === 'B') {
        e.preventDefault();
        onToggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.pathname, onToggleShortcutsModal, onOpenFeedback, onToggleSidebar]);
}
