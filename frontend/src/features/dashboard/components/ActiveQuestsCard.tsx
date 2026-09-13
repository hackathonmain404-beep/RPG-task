import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sword, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Heart,
  Plus
} from 'lucide-react';
import type { Task } from '../../../types/contract';

interface ActiveQuestsCardProps {
  tasks?: Task[];
  pendingTaskIds?: Set<string>;
  onCompleteQuest: (taskId: string) => void;
  onCreateQuest?: () => void;
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.FC<{ size?: number; color?: string }>; color: string }> = {
  intellect: { label: 'Technical', icon: Brain, color: '#38bdf8' },
  strength: { label: 'Health & Fitness', icon: Dumbbell, color: '#ef4444' },
  wisdom: { label: 'Learning', icon: BookOpen, color: '#14b8a6' },
  charisma: { label: 'Social', icon: Sparkles, color: '#a855f7' },
  vitality: { label: 'Vitality', icon: Heart, color: '#10b981' },
};

export const ActiveQuestsCard: React.FC<ActiveQuestsCardProps> = ({
  tasks = [],
  pendingTaskIds = new Set(),
  onCompleteQuest,
  onCreateQuest,
}) => {
  const activeTasks = tasks.filter(t => !t.completed);

  // Fallback demo active quests if user has none
  const displayTasks: Array<Partial<Task> & { progress?: number }> = activeTasks.length > 0 
    ? activeTasks.slice(0, 4).map((t, idx) => ({
        ...t,
        progress: idx === 0 ? 75 : undefined,
      }))
    : [
        {
          id: 'demo-1',
          title: 'Build Landing Page',
          categoryKey: 'intellect',
          difficulty: 'hard',
          xpReward: 100,
          progress: 75,
        },
        {
          id: 'demo-2',
          title: 'Morning Workout',
          categoryKey: 'strength',
          difficulty: 'medium',
          xpReward: 30,
        },
        {
          id: 'demo-3',
          title: 'Read 20 Pages',
          categoryKey: 'wisdom',
          difficulty: 'easy',
          xpReward: 15,
        },
      ];

  const hasRealTasks = activeTasks.length > 0;

  return (
    <div className="active-quests-card rpg-card">
      <div className="active-quests-header">
        <div className="section-title-with-icon">
          <Sword size={18} className="title-icon-sword" />
          <h3 className="section-card-title">ACTIVE QUESTS</h3>
        </div>

        <Link to="/app/quests" className="view-all-quests-link">
          <span>View All Quests</span>
          <ArrowRight size={14} className="view-all-arrow" />
        </Link>
      </div>

      <div className="active-quests-list">
        {displayTasks.map((quest) => {
          const catInfo = CATEGORY_MAP[quest.categoryKey?.toLowerCase() || 'intellect'] || {
            label: quest.categoryKey || 'General',
            icon: Brain,
            color: '#38bdf8',
          };
          const CatIcon = catInfo.icon;
          const isPending = quest.id ? pendingTaskIds.has(quest.id) : false;

          return (
            <div key={quest.id || quest.title} className="active-quest-item">
              {/* Checkbox / Completion State */}
              <button
                type="button"
                className={`quest-checkbox-btn ${isPending ? 'pending' : ''}`}
                onClick={() => {
                  if (quest.id && hasRealTasks) {
                    onCompleteQuest(quest.id);
                  }
                }}
                disabled={isPending}
                aria-label={`Mark quest "${quest.title}" as complete`}
              >
                <Check size={14} className="checkbox-check-icon" />
              </button>

              {/* Main Info */}
              <div className="quest-info-block">
                <div className="quest-title-row">
                  <span className="quest-item-title">{quest.title}</span>
                </div>

                <div className="quest-tags-row">
                  <span className="quest-category-badge" style={{ color: catInfo.color }}>
                    <CatIcon size={12} />
                    <span>{catInfo.label}</span>
                  </span>

                  <span className="bullet-sep">·</span>

                  <span className={`quest-priority-badge priority-${quest.difficulty?.toLowerCase() || 'medium'}`}>
                    {quest.difficulty === 'hard' ? 'High Priority' : quest.difficulty === 'epic' ? 'Epic Quest' : quest.difficulty === 'easy' ? 'Easy' : 'Medium'}
                  </span>

                  {quest.progress !== undefined && (
                    <>
                      <span className="bullet-sep">·</span>
                      <span className="quest-progress-snippet mono-numbers">{quest.progress}%</span>
                    </>
                  )}
                </div>

                {/* Progress bar if present */}
                {quest.progress !== undefined && (
                  <div className="quest-item-track" role="progressbar" aria-valuenow={quest.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div 
                      className="quest-item-fill" 
                      style={{ width: `${quest.progress}%` }} 
                    />
                  </div>
                )}
              </div>

              {/* XP Reward & Right Action */}
              <div className="quest-right-actions">
                <span className="quest-xp-chip">
                  +{quest.xpReward || 50} XP
                </span>
                <Link to="/app/quests" className="quest-row-arrow-link" aria-label={`Open details for ${quest.title}`}>
                  <ArrowRight size={16} className="quest-row-arrow" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {!hasRealTasks && (
        <div className="active-quests-empty-note">
          <p>Showing sample active tasks. Create your first live quest to take immediate action.</p>
          {onCreateQuest && (
            <button 
              type="button" 
              onClick={onCreateQuest} 
              className="rpg-btn rpg-btn-primary empty-state-create-btn"
            >
              <Plus size={15} />
              <span>Create Your First Quest →</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
