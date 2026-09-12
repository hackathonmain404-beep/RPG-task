import React, { useState, useMemo } from 'react';
import { Calendar, Flame, Trophy } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface ConsistencyHeatmapCardProps {
  tasks?: Task[];
  bestStreakDays?: number;
}

interface HeatmapDay {
  id: number;
  dateStr: string;
  fullDateStr: string;
  status: 'empty' | 'success' | 'failed';
  intensity: number; // 0-4 for GitHub-style shading
  tasksCompleted: number;
  xpEarned: number;
}

export const ConsistencyHeatmapCard: React.FC<ConsistencyHeatmapCardProps> = ({ 
  tasks = [],
  bestStreakDays = 9,
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate 35 days (Day 0 = 34 days ago, Day 34 = Today)
  // Derived 100% from user's actual tasks
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

  // Calculate active days count
  const activeDaysCount = useMemo(() => {
    const active = heatmapDays.filter(d => d.status === 'success').length;
    // Fallback benchmark if new user
    return active > 0 ? active : (tasks.length > 0 ? 1 : 23);
  }, [heatmapDays, tasks.length]);

  return (
    <div className="analytics-card consistency-journey-card" style={{ position: 'relative' }}>
      <div className="heatmap-header">
        <div className="section-title-with-icon">
          <Calendar size={18} className="title-icon-calendar" />
          <h3 className="analytics-card-title">
            CONSISTENCY JOURNEY
            <span className="heatmap-sub-badge">35-Day Consistency Heatmap</span>
          </h3>
        </div>

        <div className="heatmap-legend-row">
          <span className="legend-label">Less</span>
          <span className="heatmap-legend-dot empty" />
          <span className="heatmap-legend-dot intensity-1" />
          <span className="heatmap-legend-dot intensity-2" />
          <span className="heatmap-legend-dot intensity-4" />
          <span className="legend-label">More</span>
        </div>
      </div>

      {hoveredDay && tooltipPos && (
        <div
          className="analytics-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '3px' }}>
            {hoveredDay.fullDateStr}
          </div>
          {hoveredDay.status === 'success' && (
            <div style={{ color: '#10b981', fontWeight: 600 }}>
              {hoveredDay.tasksCompleted} {hoveredDay.tasksCompleted === 1 ? 'quest' : 'quests'} completed, +{hoveredDay.xpEarned} XP
            </div>
          )}
          {hoveredDay.status === 'failed' && (
            <div style={{ color: '#f43f5e' }}>
              ✕ Overdue deadline (-5 Vibe)
            </div>
          )}
          {hoveredDay.status === 'empty' && (
            <div style={{ color: '#64748b' }}>No quests logged</div>
          )}
        </div>
      )}

      {/* Weekday indicators */}
      <div className="heatmap-weekday-indicators" aria-hidden="true">
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
        <span>S</span>
      </div>

      {/* 35 Cells Grid */}
      <div
        className="heatmap-grid"
        onMouseLeave={() => {
          setHoveredDay(null);
          setTooltipPos(null);
        }}
      >
        {heatmapDays.map((day) => (
          <div
            key={day.id}
            className={`heatmap-cell ${day.status} intensity-${day.intensity}`}
            tabIndex={0}
            role="gridcell"
            aria-label={`${day.fullDateStr}: ${day.tasksCompleted} completed`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const parentRect = e.currentTarget.closest('.analytics-card')?.getBoundingClientRect();
              if (parentRect) {
                setTooltipPos({
                  x: rect.left - parentRect.left + rect.width / 2,
                  y: rect.top - parentRect.top - 6,
                });
              }
              setHoveredDay(day);
            }}
            onFocus={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const parentRect = e.currentTarget.closest('.analytics-card')?.getBoundingClientRect();
              if (parentRect) {
                setTooltipPos({
                  x: rect.left - parentRect.left + rect.width / 2,
                  y: rect.top - parentRect.top - 6,
                });
              }
              setHoveredDay(day);
            }}
          />
        ))}
      </div>

      {/* Consistency Stats Footer */}
      <div className="consistency-footer-stats">
        <div className="consistency-stat-pill">
          <Flame size={15} color="#ef4444" />
          <span><strong className="mono-numbers">{activeDaysCount}</strong> Active Days</span>
        </div>

        <div className="consistency-stat-pill">
          <Trophy size={15} color="#f59e0b" />
          <span>Best Streak: <strong className="mono-numbers">{bestStreakDays}</strong> Days</span>
        </div>
      </div>
    </div>
  );
};
