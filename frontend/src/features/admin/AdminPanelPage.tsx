import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout, type AdminTab } from './AdminLayout';
import { AdminPageTransition } from './AdminPageTransition';
import { UsersEconomyTab } from './UsersEconomyTab';
import { BroadcastsSurgeTab } from './BroadcastsSurgeTab';
import { FeedbackDeskTab } from './FeedbackDeskTab';
import { MarketStudioTab } from './MarketStudioTab';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

const VALID_TABS: AdminTab[] = ['users', 'broadcasts', 'feedback', 'market'];

export const AdminPanelPage: React.FC = () => {
  useDocumentMetadata('Achiever Admin Panel', {
    description: 'Root administration panel for users, economy, platform broadcasts, surge events, and shop items.',
    noindex: true,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as AdminTab;
  const activeTab: AdminTab = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'users';

  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Smooth scroll to top on tab change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      // Safe fallback for environments where scrollTo is not implemented
    }
  }, [activeTab]);

  const handleTabChange = (tab: AdminTab) => {
    if (tab === activeTab) return;
    setIsNavigating(true);
    setSearchParams({ tab });
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 240);
    return () => clearTimeout(timer);
  };

  return (
    <AdminLayout currentTab={activeTab} onTabChange={handleTabChange} isNavigating={isNavigating}>
      <AdminPageTransition activeTab={activeTab} isNavigating={isNavigating}>
        {activeTab === 'users' && <UsersEconomyTab />}
        {activeTab === 'broadcasts' && <BroadcastsSurgeTab />}
        {activeTab === 'feedback' && <FeedbackDeskTab />}
        {activeTab === 'market' && <MarketStudioTab />}
      </AdminPageTransition>
    </AdminLayout>
  );
};

