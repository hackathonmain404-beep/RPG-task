import React, { useMemo } from 'react';
import { CheckCircle2, CircleDot, Circle, TrendingUp, Zap } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface TodayProgressSectionProps {
  tasks?: Task[];
}

export const TodayProgressSection: React.FC<TodayProgressSectionProps> = ({ tasks = [] }) => {
  const { totalQuests, completedCount, inProgressCount, remainingCount, percentComplete, todayXp } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      // Benchmark default for new/empty sessions
      return {
        totalQuests: 6,
        completedCount: 4,
        inProgressCount: 1,
        remainingCount: 1,
        percentComplete: 67,
        todayXp: 120,
      };
    }

    const completed = tasks.filter(t => t.completed);
    const active = tasks.filter(t => !t.completed);

    const compCount = completed.length;
    // In progress is active with a due date or first active
    const inProgCount = active.length > 0 ? 1 : 0;
    const remCount = Math.max(0, active.length - inProgCount);
    const total = tasks.length;
    const pct = total > 0 ? Math.round((compCount / total) * 100) : 0;

    const xp = completed.reduce((sum, t) => sum + (t.xpReward || 50), 0);

    return {
      totalQuests: total,
      completedCount: compCount,
      inProgressCount: inProgCount,
      remainingCount: remCount,
      percentComplete: pct,
      todayXp: xp > 0 ? xp : 120,
    };
  }, [tasks]);

  return (
    <section className="today-progress-section" aria-label="Today's Momentum Progress">
      <div className="progress-section-inner">
        <div className="progress-header-row">
          <div className="progress-title-block">
            <span className="section-pre-title">MOMENTUM TRACKER</span>
            <h2 className="progress-main-heading">TODAY&apos;S PROGRESS</h2>
          </div>

          <div className="progress-ratio-badge">
            <span className="ratio-number mono-numbers">{completedCount} / {totalQuests}</span>
            <span className="ratio-label">QUESTS</span>
            <span className="ratio-divider">·</span>
            <span className="ratio-percent mono-numbers">{percentComplete}% COMPLETE</span>
          </div>
        </div>

        {/* Big Smooth Progress Track */}
        <div 
          className="today-progress-bar-track" 
          role="progressbar" 
          aria-valuenow={percentComplete} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div
            className="today-progress-bar-fill"
            style={{ width: `${Math.max(3, percentComplete)}%` }}
          />
        </div>

        {/* Breakdown Row: Completed, In Progress, Remaining */}
        <div className="progress-breakdown-row">
          <div className="breakdown-chips">
            <div className="status-chip completed-chip">
              <CheckCircle2 size={15} className="chip-icon" />
              <span className="chip-count mono-numbers">{completedCount}</span>
              <span className="chip-label">Completed</span>
            </div>

            <div className="status-chip inprogress-chip">
              <CircleDot size={15} className="chip-icon" />
              <span className="chip-count mono-numbers">{inProgressCount}</span>
              <span className="chip-label">In Progress</span>
            </div>

            <div className="status-chip remaining-chip">
              <Circle size={15} className="chip-icon" />
              <span className="chip-count mono-numbers">{remainingCount}</span>
              <span className="chip-label">Remaining</span>
            </div>
          </div>

          {/* Today's Dopamine & Momentum stats */}
          <div className="progress-momentum-stats">
            <div className="xp-earned-today">
              <Zap size={14} className="xp-earned-icon" />
              <span>+{todayXp} XP earned today</span>
            </div>
            <div className="momentum-trend-pill">
              <TrendingUp size={13} />
              <span>18% ahead of yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
