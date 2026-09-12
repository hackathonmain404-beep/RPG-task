import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { useQuests } from '../../context/useQuests';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { characterApi, type CharacterResponse } from '../../services/api/character';
import { RewardToast } from '../../components/common/RewardToast';
import { LevelUpOverlay } from '../../components/common/LevelUpOverlay';
import { QuestComposerModal } from '../quests/QuestComposerModal';
import type { Attribute, CreateTaskRequest } from '../../types/contract';
import './dashboard-analytics.css';

// Command Center Components
import { HeroCurrentAdventure } from './components/HeroCurrentAdventure';
import { QuickActionsRow } from './components/QuickActionsRow';
import { PlayerStatsCards } from './components/PlayerStatsCards';
import { TodayProgressSection } from './components/TodayProgressSection';
import { ActiveQuestsCard } from './components/ActiveQuestsCard';
import { CharacterPreviewCard } from './components/CharacterPreviewCard';
import { ProductivityTrendsCard } from './components/ProductivityTrendsCard';
import { VibeScoreCard } from './components/VibeScoreCard';
import { RecentAchievementsCard } from './components/RecentAchievementsCard';
import { RecentActivityTimeline } from './components/RecentActivityTimeline';
import { ConsistencyHeatmapCard } from './components/ConsistencyHeatmapCard';
import { CompletedCategoriesCard } from './components/CompletedCategoriesCard';
import { AccountabilityMatrix } from './components/AccountabilityMatrix';

import { ChevronDown, ChevronUp, Database } from 'lucide-react';

const DEFAULT_ATTRIBUTES: Attribute[] = [
  { key: 'intellect', displayName: 'Intellect', value: 0 },
  { key: 'strength', displayName: 'Strength', value: 0 },
  { key: 'wisdom', displayName: 'Wisdom', value: 0 },
  { key: 'charisma', displayName: 'Charisma', value: 0 },
  { key: 'vitality', displayName: 'Vitality', value: 0 },
];

export const DashboardPage: React.FC = () => {
  useDocumentMetadata('Command Center | Achiever', { noindex: true });

  const { user, character, xpProgress, recentActivity } = useAuth();
  const { 
    tasks, 
    pendingTaskIds, 
    completeTask, 
    createTask,
    lastRewardNotice, 
    clearRewardNotice, 
    levelUpEvent, 
    clearLevelUpEvent 
  } = useQuests();

  const [charData, setCharData] = useState<CharacterResponse | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);

  // Fetch character attributes from backend
  useEffect(() => {
    let ignore = false;
    characterApi.getCharacter()
      .then(data => { if (!ignore) setCharData(data); })
      .catch(() => { /* supplementary data for dashboard */ });
    return () => { ignore = true; };
  }, []);

  const attributes: Attribute[] = charData?.attributes && charData.attributes.length > 0
    ? charData.attributes
    : (character?.attributes && character.attributes.length > 0)
      ? character.attributes
      : DEFAULT_ATTRIBUTES;

  const handleCreateTask = useCallback(async (data: CreateTaskRequest) => {
    await createTask(data);
    setIsComposerOpen(false);
  }, [createTask]);

  const handleCompleteQuest = useCallback(async (taskId: string) => {
    await completeTask(taskId);
  }, [completeTask]);

  return (
    <div className="command-center-container">
      {/* Real-time Reward Toast */}
      {lastRewardNotice && (
        <div className="reward-toast-container">
          <RewardToast reward={lastRewardNotice} onDismiss={clearRewardNotice} />
        </div>
      )}

      {/* Level-Up Celebration Overlay */}
      {levelUpEvent && (
        <LevelUpOverlay event={levelUpEvent} onDismiss={clearLevelUpEvent} />
      )}

      {/* Quest Composer Modal for Quick In-Place Quest Creation */}
      <QuestComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* 1. HERO SECTION: CURRENT ADVENTURE & TODAY'S MAIN QUEST */}
      <HeroCurrentAdventure
        userDisplayName={user?.displayName || 'Adventurer'}
        tasks={tasks}
        streakDays={character?.streakCurrent || 0}
        onCreateQuest={() => setIsComposerOpen(true)}
      />

      {/* 2. QUICK ACTIONS ROW */}
      <QuickActionsRow
        onCreateQuest={() => setIsComposerOpen(true)}
      />

      {/* 3. PLAYER STATS: LEVEL, XP, GOLD, STREAK */}
      <PlayerStatsCards
        character={character}
        xpProgress={xpProgress}
      />

      {/* 4. TODAY'S PROGRESS & MOMENTUM TRACKER */}
      <TodayProgressSection
        tasks={tasks}
      />

      {/* 5. ACTION-FIRST 2-COLUMN: ACTIVE QUESTS (MAIN) + CHARACTER PREVIEW */}
      <div className="command-grid-2col">
        <ActiveQuestsCard
          tasks={tasks}
          pendingTaskIds={pendingTaskIds}
          onCompleteQuest={handleCompleteQuest}
          onCreateQuest={() => setIsComposerOpen(true)}
        />
        <CharacterPreviewCard
          character={character}
          attributes={attributes}
        />
      </div>

      {/* 6. 2-COLUMN: PRODUCTIVITY JOURNEY + VIBE SCORE */}
      <div className="command-grid-2col">
        <ProductivityTrendsCard
          tasks={tasks}
        />
        <VibeScoreCard
          tasks={tasks}
        />
      </div>

      {/* 7. 2-COLUMN: RECENT ACHIEVEMENTS + RECENT ACTIVITY */}
      <div className="command-grid-2col-equal">
        <RecentAchievementsCard
          tasks={tasks}
          character={character}
        />
        <RecentActivityTimeline
          tasks={tasks}
          recentActivity={recentActivity}
        />
      </div>

      {/* 8. FULL-WIDTH: CONSISTENCY JOURNEY */}
      <ConsistencyHeatmapCard
        tasks={tasks}
        bestStreakDays={character?.streakBest || 9}
      />

      {/* 9. DEEP DATA & ACCOUNTABILITY AUDIT DRAWER (Optional Inspection) */}
      <div className="accountability-audit-section">
        <button
          type="button"
          onClick={() => setIsAuditDrawerOpen(prev => !prev)}
          className="audit-drawer-toggle"
          aria-expanded={isAuditDrawerOpen}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={16} color="#38bdf8" />
            <span>Citadel Accountability Audit & Category Breakdown</span>
          </div>
          {isAuditDrawerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isAuditDrawerOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <CompletedCategoriesCard tasks={tasks} />
            <AccountabilityMatrix tasks={tasks} />
          </div>
        )}
      </div>
    </div>
  );
};
