import React, { useState, useMemo } from 'react';
import type { Task } from '../../../types/contract';

interface ConsistencyHeatmapCardProps {
  tasks?: Task[];
}

interface HeatmapDay {
  id: number;
  dateStr: string;
  fullDateStr: string;
  status: 'empty' | 'success' | 'failed';
  intensity: number;
  tasksCompleted: number;
  xpEarned: number;
}

export const ConsistencyHeatmapCard: React.FC<ConsistencyHeatmapCardProps> = ({ tasks = [] }) => {
  const [activeDay, setActiveDay] = useState<HeatmapDay | null>(null);
  const [displayDay, setDisplayDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isGliding, setIsGliding] = useState(false);

  // Generate 35 days (Day 0 = 34 days ago, Day 34 = Today)
  // Derived 100% from user's actual tasks — ZERO hardcoded cells
  const heatmapDays: HeatmapDay[] = useMemo(() => {
    const now = new Date();

    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (34 - i));
      d.setHours(0, 0, 0, 0);

      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      // Find real user tasks completed on this calendar day
      const completedOnDay = tasks.filter((t) => {
        if (!t.completed) return false;
        const compDate = t.completedAt ? new Date(t.completedAt) : t.updatedAt ? new Date(t.updatedAt) : null;
        if (!compDate) {
          // If no timestamp, map to today if it's the last cell
          return i === 34;
        }
        return compDate >= d && compDate <= dEnd;
      });

      // Find real user tasks that became overdue on this day
      const failedOnDay = tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= d && dueDate <= dEnd && dueDate < now;
      });

      let status: 'empty' | 'success' | 'failed' = 'empty';
      let tasksCompleted = 0;
      let xpEarned = 0;
      let intensity = 0;

      if (completedOnDay.length > 0) {
        status = 'success';
        tasksCompleted = completedOnDay.length;
        xpEarned = completedOnDay.reduce((sum, t) => sum + (t.xpReward || 50), 0);
        intensity = Math.min(4, Math.max(1, tasksCompleted));
      } else if (failedOnDay.length > 0) {
        status = 'failed';
        intensity = 1;
      }

      return {
        id: i,
        dateStr,
        fullDateStr,
        status,
        intensity,
        tasksCompleted,
        xpEarned,
      };
    });
  }, [tasks]);

  const handleCellHover = (day: HeatmapDay, e: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.analytics-card')?.getBoundingClientRect();
    if (parentRect) {
      setTooltipPos({
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 8,
      });
    }
    setActiveDay(day);
    setDisplayDay(day);
    setIsHovered(true);
    setIsGliding(true);
  };

  const handleMouseLeave = () => {
    setActiveDay(null);
    setIsHovered(false);
    setTimeout(() => {
      setIsGliding(false);
    }, 260);
  };

  return (
    <div className="analytics-card card-analytics-heatmap anim-entrance-8" style={{ position: 'relative' }}>
      <div className="heatmap-header">
        <h3 className="analytics-card-title" style={{ fontSize: '1rem' }}>
          35-Day Consistency Heatmap
        </h3>
      </div>

      {/* Floating tooltip with smooth gliding and fade transitions */}
      <div
        className={`analytics-tooltip ${isHovered ? 'visible' : ''} ${isGliding ? 'gliding' : ''}`}
        style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        aria-hidden={!isHovered}
      >
        {displayDay && (
          <>
            <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
              {displayDay.fullDateStr || displayDay.dateStr}
            </div>
            {displayDay.status === 'success' && (
              <div style={{ color: '#10b981', fontWeight: 600 }}>
                ✓ {displayDay.tasksCompleted} {displayDay.tasksCompleted === 1 ? 'task' : 'tasks'} completed (+{displayDay.xpEarned} XP)
              </div>
            )}
            {displayDay.status === 'failed' && (
              <div style={{ color: '#f43f5e', fontWeight: 600 }}>
                ✕ Overdue deadline (-5 Vibe)
              </div>
            )}
            {displayDay.status === 'empty' && (
              <div style={{ color: '#64748b' }}>No activity logged</div>
            )}
          </>
        )}
      </div>

      <div
        className="heatmap-grid"
        onMouseLeave={handleMouseLeave}
      >
        {heatmapDays.map((day) => {
          const isCellActive = activeDay?.id === day.id;
          return (
            <div
              key={day.id}
              className={`heatmap-cell ${day.status} intensity-${day.intensity} ${isCellActive ? 'is-active' : ''}`}
              style={{
                animationDelay: `${day.id * 10}ms`,
              }}
              tabIndex={0}
              role="gridcell"
              aria-label={`${day.dateStr}: ${day.tasksCompleted} tasks completed`}
              onMouseEnter={(e) => handleCellHover(day, e)}
              onFocus={(e) => handleCellHover(day, e)}
            />
          );
        })}
      </div>
    </div>
  );
};
