import React, { useState, useMemo } from 'react';
import { Folder } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface CompletedCategoriesCardProps {
  tasks?: Task[];
}

interface CategoryItem {
  id: string;
  name: string;
  percentage: number;
  color: string;
  count: number;
}

const CATEGORY_META: Record<string, { name: string; color: string }> = {
  intellect: { name: 'Imp. Work', color: '#3b82f6' },
  vitality: { name: 'Personal', color: '#a855f7' },
  personal: { name: 'Personal', color: '#a855f7' },
  wisdom: { name: 'Learning', color: '#38bdf8' },
  strength: { name: 'Strength', color: '#ef4444' },
  charisma: { name: 'Social', color: '#eab308' },
  general: { name: 'General', color: '#f59e0b' },
};

export const CompletedCategoriesCard: React.FC<CompletedCategoriesCardProps> = ({ tasks = [] }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Derive strictly from the user's real completed tasks
  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);
  const totalCompleted = completedTasks.length;

  const categories: CategoryItem[] = useMemo(() => {
    if (totalCompleted === 0) return [];

    const counts: Record<string, number> = {};
    for (const t of completedTasks) {
      const key = (t.categoryKey || 'general').toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }

    const keys = Object.keys(counts);
    return keys.map((key) => {
      const count = counts[key];
      const meta = CATEGORY_META[key] || {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        color: '#10b981',
      };
      const percentage = Math.round((count / totalCompleted) * 100);
      return {
        id: key,
        name: meta.name,
        percentage,
        color: meta.color,
        count,
      };
    });
  }, [completedTasks, totalCompleted]);

  // SVG Donut settings
  const size = 150;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="analytics-card">
      <h3 className="analytics-card-title" style={{ marginBottom: '1.25rem' }}>
        Completed Categories
      </h3>

      <div className="donut-container">
        {/* Donut Chart */}
        <div className="donut-chart-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth={strokeWidth}
            />

            {/* Render Segments based 100% on real completed tasks */}
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;

              const isHovered = hoveredCategory === cat.id;

              return (
                <circle
                  key={cat.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredCategory && !isHovered ? 0.6 : 1,
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Text */}
          <div className="donut-center-text">
            <span className="donut-total-number">{totalCompleted}</span>
            <span className="donut-total-label">TOTAL</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="category-legend-list">
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.82rem', padding: '0.5rem 0' }}>
              No completed quests yet.
            </div>
          ) : (
            categories.map((cat) => {
              const isHovered = hoveredCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className="category-legend-row"
                  style={{
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="category-legend-left">
                    <span
                      className="category-folder-icon"
                      style={{ color: cat.color }}
                    >
                      <Folder size={14} fill={cat.color} stroke={cat.color} />
                    </span>
                    <span style={{ color: isHovered ? '#ffffff' : '#cbd5e1', fontWeight: 500 }}>
                      {cat.name} ({cat.count})
                    </span>
                  </div>
                  <span className="category-percentage" style={{ color: isHovered ? cat.color : '#f1f5f9' }}>
                    {cat.percentage}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
