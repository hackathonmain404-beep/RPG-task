import React from 'react';
import { Trophy, Flame, BookOpen, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import type { Task, Character } from '../../../types/contract';

interface RecentAchievementsCardProps {
  tasks?: Task[];
  character?: Character | null;
}

interface AchievementItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  progressText?: string;
}

export const RecentAchievementsCard: React.FC<RecentAchievementsCardProps> = ({
  tasks = [],
  character,
}) => {
  const completedTasks = tasks.filter(t => t.completed);
  const streak = character?.streakCurrent ?? 0;
  const learningCompleted = completedTasks.filter(t => 
    t.categoryKey?.toLowerCase() === 'wisdom' || t.categoryKey?.toLowerCase() === 'intellect'
  ).length;

  const achievements: AchievementItem[] = [
    {
      id: 'first-quest',
      icon: '🥇',
      title: 'FIRST QUEST',
      description: 'Completed your first quest',
      xpReward: 50,
      unlocked: completedTasks.length >= 1,
      progressText: completedTasks.length >= 1 ? 'Unlocked' : '0/1 Quests',
    },
    {
      id: 'on-fire',
      icon: '🔥',
      title: 'ON FIRE',
      description: '3 consecutive productive days',
      xpReward: 100,
      unlocked: streak >= 3,
      progressText: streak >= 3 ? 'Unlocked' : `${streak}/3 Days`,
    },
    {
      id: 'scholar',
      icon: '📚',
      title: 'SCHOLAR',
      description: 'Completed 10 learning quests',
      xpReward: 250,
      unlocked: learningCompleted >= 10,
      progressText: learningCompleted >= 10 ? 'Unlocked' : `${learningCompleted}/10 Quests`,
    },
    {
      id: 'citadel-veteran',
      icon: '⚔️',
      title: 'CITADEL VETERAN',
      description: 'Reach Character Level 5',
      xpReward: 500,
      unlocked: (character?.level ?? 1) >= 5,
      progressText: (character?.level ?? 1) >= 5 ? 'Unlocked' : `Lv.${character?.level ?? 1}/5`,
    },
  ];

  return (
    <div className="achievements-card rpg-card">
      <div className="achievements-header">
        <div className="section-title-with-icon">
          <Trophy size={18} className="title-icon-trophy" />
          <h3 className="section-card-title">RECENT ACHIEVEMENTS</h3>
        </div>
        <span className="achievements-unlocked-count">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED
        </span>
      </div>

      <div className="achievements-grid">
        {achievements.map((item) => (
          <div
            key={item.id}
            className={`achievement-tile ${item.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon-frame">
              <span className="achievement-emoji">{item.icon}</span>
              {item.unlocked ? (
                <CheckCircle2 size={12} className="achievement-status-badge unlocked" />
              ) : (
                <Lock size={12} className="achievement-status-badge locked" />
              )}
            </div>

            <div className="achievement-details">
              <div className="achievement-title-row">
                <span className="achievement-title">{item.title}</span>
                <span className="achievement-xp-tag">+{item.xpReward} XP</span>
              </div>
              <p className="achievement-desc">{item.description}</p>
              <span className="achievement-prog-caption">{item.progressText}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
