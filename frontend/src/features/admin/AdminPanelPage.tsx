import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout, type AdminTab } from './AdminLayout';
import { UsersEconomyTab } from './UsersEconomyTab';
import { BroadcastsSurgeTab } from './BroadcastsSurgeTab';
import { FeedbackDeskTab } from './FeedbackDeskTab';
import { MarketStudioTab } from './MarketStudioTab';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const AdminPanelPage: React.FC = () => {
  useDocumentMetadata('Achiever Admin Panel', {
    description: 'Root administration panel for users, economy, platform broadcasts, surge events, and shop items.',
    noindex: true,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as AdminTab) || 'users';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <AdminLayout currentTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'users' && <UsersEconomyTab />}
      {activeTab === 'broadcasts' && <BroadcastsSurgeTab />}
      {activeTab === 'feedback' && <FeedbackDeskTab />}
      {activeTab === 'market' && <MarketStudioTab />}
    </AdminLayout>
  );
};
