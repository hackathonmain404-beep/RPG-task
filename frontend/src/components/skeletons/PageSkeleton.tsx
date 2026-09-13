import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardSkeleton } from './DashboardSkeleton';
import { QuestsSkeleton } from './QuestsSkeleton';
import { CharacterSkeleton } from './CharacterSkeleton';
import { ShopSkeleton } from './ShopSkeleton';
import { ThemesSkeleton } from './ThemesSkeleton';
import { InventorySkeleton } from './InventorySkeleton';
import { SettingsSkeleton } from './SettingsSkeleton';
import { FeedbackSkeleton } from './FeedbackSkeleton';

export interface PageSkeletonProps {
  page?: 'dashboard' | 'quests' | 'character' | 'shop' | 'themes' | 'inventory' | 'settings' | 'feedback';
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({ page }) => {
  const location = useLocation();

  const target = page || (() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('quest')) return 'quests';
    if (path.includes('character')) return 'character';
    if (path.includes('shop') || path.includes('armory')) return 'shop';
    if (path.includes('theme')) return 'themes';
    if (path.includes('inventory')) return 'inventory';
    if (path.includes('setting')) return 'settings';
    if (path.includes('feedback')) return 'feedback';
    return 'dashboard';
  })();

  switch (target) {
    case 'quests':
      return <QuestsSkeleton />;
    case 'character':
      return <CharacterSkeleton />;
    case 'shop':
      return <ShopSkeleton />;
    case 'themes':
      return <ThemesSkeleton />;
    case 'inventory':
      return <InventorySkeleton />;
    case 'settings':
      return <SettingsSkeleton />;
    case 'feedback':
      return <FeedbackSkeleton />;
    case 'dashboard':
    default:
      return <DashboardSkeleton />;
  }
};
