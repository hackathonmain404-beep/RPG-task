import React, { useState } from 'react';
import type { Task } from '../../../types/contract';

interface ConsistencyHeatmapCardProps {
  tasks?: Task[];
}

interface HeatmapDay {
  id: number;
  dateStr: string;
  status: 'empty' | 'success' | 'failed';
  tasksCompleted: number;
  xpEarned: number;
}

export const ConsistencyHeatmapCard: React.FC<ConsistencyHeatmapCardProps> = ({ tasks = [] }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate 35 days matching the pattern in the reference screenshot
  // Row 1 (18 days), Row 2 (17 days) = 35 days total
  const heatmapDays: HeatmapDay[] = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Cell patterns matching the screenshot:
    // Row 1 has red at index 3, green at 4, 5, 6
    // Row 2 has green at index 21, red at index 22
    let status: 'empty' | 'success' | 'failed' = 'empty';
    let tasksCompleted = 0;
    let xpEarned = 0;

    if (i === 3) {
      status = 'failed';
      tasksCompleted = 0;
      xpEarned = 0;
    } else if (i === 4 || i === 5 || i === 6) {
      status = 'success';
      tasksCompleted = i === 5 ? 3 : 2;
      xpEarned = tasksCompleted * 50;
    } else if (i === 21) {
      status = 'success';
      tasksCompleted = 1;
      xpEarned = 50;
    } else if (i === 22) {
      status = 'failed';
      tasksCompleted = 0;
      xpEarned = 0;
    } else if (i === 34 && tasks.some(t => t.completed)) {
      status = 'success';
      tasksCompleted = tasks.filter(t => t.completed).length;
      xpEarned = tasksCompleted * 50;
    }

    return {
      id: i,
      dateStr,
      status,
      tasksCompleted,
      xpEarned,
    };
  });

  return (
    <div className="analytics-card" style={{ position: 'relative' }}>
      <div className="heatmap-header">
        <h3 className="analytics-card-title" style={{ fontSize: '1rem' }}>
          35-Day Consistency Heatmap
        </h3>
      </div>

      {hoveredDay && tooltipPos && (
        <div
          className="analytics-tooltip"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
            {hoveredDay.dateStr}
          </div>
          {hoveredDay.status === 'success' && (
            <div style={{ color: '#10b981' }}>
              ✓ {hoveredDay.tasksCompleted} tasks completed (+{hoveredDay.xpEarned} XP)
            </div>
          )}
          {hoveredDay.status === 'failed' && (
            <div style={{ color: '#f43f5e' }}>
              ✕ 1 missed / overdue deadline (-5 Vibe)
            </div>
          )}
          {hoveredDay.status === 'empty' && (
            <div style={{ color: '#64748b' }}>No activity logged</div>
          )}
        </div>
      )}

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
            className={`heatmap-cell ${day.status}`}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const parentRect = e.currentTarget.closest('.analytics-card')?.getBoundingClientRect();
              if (parentRect) {
                setTooltipPos({
                  x: rect.left - parentRect.left + rect.width / 2,
                  y: rect.top - parentRect.top - 4,
                });
              }
              setHoveredDay(day);
            }}
          />
        ))}
      </div>
    </div>
  );
};
