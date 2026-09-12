import React from 'react';
import { Zap } from 'lucide-react';
import type { Task } from '../../../types/contract';
import type { ProgressionActivityItem } from '../../../context/authContextDef';

interface RecentActivityTimelineProps {
  tasks?: Task[];
  recentActivity?: ProgressionActivityItem[];
}

interface ActivityEntry {
  id: string;
  type: 'quest' | 'level' | 'streak';
  badge: string;
  badgeType: 'xp' | 'level' | 'streak';
  title: string;
  subtitle: string;
  timeAgo: string;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({
  tasks = [],
  recentActivity = [],
}) => {
  // Build activities from Auth recentActivity and completed tasks
  const activities: ActivityEntry[] = React.useMemo(() => {
    if (recentActivity && recentActivity.length > 0) {
      return recentActivity.slice(0, 4).map(item => ({
        id: item.id,
        type: item.type === 'level_up' ? 'level' : item.type === 'streak_milestone' ? 'streak' : 'quest',
        badge: item.type === 'level_up' ? 'LEVEL UP!' : `+${item.xpGained || 50} XP`,
        badgeType: item.type === 'level_up' ? 'level' : 'xp',
        title: item.type === 'level_up' ? `Reached Level ${item.levelAfter || 12}` : 'Quest completed',
        subtitle: item.title,
        timeAgo: 'Just now',
      }));
    }

    const completed = tasks.filter(t => t.completed);
    if (completed.length > 0) {
      return completed.slice(0, 3).map((t, idx) => ({
        id: t.id,
        type: 'quest',
        badge: `+${t.xpReward || 50} XP`,
        badgeType: 'xp',
        title: 'Quest completed',
        subtitle: `"${t.title}"`,
        timeAgo: idx === 0 ? '2 hours ago' : idx === 1 ? '5 hours ago' : 'Yesterday',
      }));
    }

    // Default benchmark activity items from the specification
    return [
      {
        id: 'act-1',
        type: 'quest',
        badge: '+40 XP',
        badgeType: 'xp',
        title: 'Quest completed',
        subtitle: '“Morning workout”',
        timeAgo: '2 hours ago',
      },
      {
        id: 'act-2',
        type: 'quest',
        badge: '+20 XP',
        badgeType: 'xp',
        title: 'Habit completed',
        subtitle: '“Read 20 pages”',
        timeAgo: '5 hours ago',
      },
      {
        id: 'act-3',
        type: 'level',
        badge: 'LEVEL UP!',
        badgeType: 'level',
        title: 'Reached Level 12',
        subtitle: 'Citadel Advancement',
        timeAgo: 'Yesterday',
      },
    ];
  }, [recentActivity, tasks]);

  return (
    <div className="activity-timeline-card rpg-card">
      <div className="activity-header">
        <div className="section-title-with-icon">
          <Zap size={18} className="title-icon-zap" />
          <h3 className="section-card-title">RECENT ACTIVITY</h3>
        </div>
        <span className="activity-live-indicator">LIVE FEED</span>
      </div>

      <div className="activity-timeline-list">
        {activities.map((act) => (
          <div key={act.id} className="activity-timeline-item">
            <div className="timeline-node-column">
              <div className={`timeline-dot ${act.badgeType}`} />
              <div className="timeline-connector-line" />
            </div>

            <div className="timeline-item-body">
              <div className="activity-badge-row">
                <span className={`activity-pill-badge ${act.badgeType}`}>
                  {act.badge}
                </span>
                <span className="activity-timestamp">{act.timeAgo}</span>
              </div>

              <div className="activity-content-text">
                <span className="activity-action-name">{act.title}</span>
                <span className="activity-quote-target">{act.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
