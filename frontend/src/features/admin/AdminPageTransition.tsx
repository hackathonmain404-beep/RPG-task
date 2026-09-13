import React, { useEffect, useState, useRef } from 'react';
import type { AdminTab } from './AdminLayout';

interface AdminPageTransitionProps {
  activeTab: AdminTab;
  children: React.ReactNode;
  isNavigating?: boolean;
}

const TAB_INDEX_MAP: Record<AdminTab, number> = {
  users: 0,
  broadcasts: 1,
  feedback: 2,
  market: 3,
};

export const AdminPageTransition: React.FC<AdminPageTransitionProps> = ({
  activeTab,
  children,
}) => {
  const [displayedTab, setDisplayedTab] = useState<AdminTab>(activeTab);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const prevTabRef = useRef<AdminTab>(activeTab);

  useEffect(() => {
    if (activeTab !== displayedTab) {
      const prevIdx = TAB_INDEX_MAP[prevTabRef.current] ?? 0;
      const nextIdx = TAB_INDEX_MAP[activeTab] ?? 0;
      const newDir = nextIdx >= prevIdx ? 'forward' : 'backward';
      setDirection(newDir);

      // Trigger quick 70ms exit before entering new tab
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        setDisplayedTab(activeTab);
        setIsExiting(false);
        prevTabRef.current = activeTab;
      }, 75);

      return () => clearTimeout(exitTimer);
    }
  }, [activeTab, displayedTab]);

  const stageClass = isExiting
    ? direction === 'forward'
      ? 'stage-exit-forward'
      : 'stage-exit-backward'
    : direction === 'forward'
      ? 'stage-enter-forward'
      : 'stage-enter-backward';

  return (
    <div className="cmd-tab-viewport" role="region" aria-live="polite">
      <div key={displayedTab} className={`cmd-tab-stage ${stageClass}`}>
        {children}
      </div>
    </div>
  );
};
