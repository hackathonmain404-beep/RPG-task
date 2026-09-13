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

  // SVG Donut geometry settings
  const size = 150;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Slices have a clean 5px gap when there are multiple categories to prevent any visual overlap/intersection
  const numCategories = categories.length;
  const gap = numCategories > 1 ? 5 : 0;
  const totalGap = numCategories * gap;
  const availableCircumference = Math.max(0, circumference - totalGap);

  let accumulatedOffset = 0;

  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === hoveredCategory) || null;
  }, [categories, hoveredCategory]);

  return (
    <div className="analytics-card card-analytics-categories anim-entrance-6">
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
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
              className="donut-track-circle"
            />

            {/* Render Segments based 100% on real completed tasks with zero-overlap precision */}
            {categories.map((cat) => {
              const fraction = totalCompleted > 0 ? cat.count / totalCompleted : 0;
              const arcLength = Math.max(2, fraction * availableCircumference);
              const strokeDasharray = `${arcLength} ${circumference - arcLength}`;
              const strokeDashoffset = -accumulatedOffset;
              accumulatedOffset += arcLength + gap;

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
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  className={`donut-segment-slice ${isHovered ? 'is-hovered' : ''}`}
                  style={{
                    color: cat.color,
                    opacity: hoveredCategory && !isHovered ? 0.35 : 1,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Text with dynamic focus */}
          <div className="donut-center-text donut-center-fade">
            <span
              className={`donut-total-number ${hoveredCategory ? 'is-highlighted' : ''}`}
              style={{
                color: activeCategory ? activeCategory.color : '#38bdf8',
                transition: 'color 0.2s ease',
              }}
            >
              {activeCategory ? activeCategory.count : totalCompleted}
            </span>
            <span
              className="donut-total-label"
              style={{
                color: activeCategory ? activeCategory.color : '#64748b',
                transition: 'color 0.2s ease',
              }}
            >
              {activeCategory ? activeCategory.name.toUpperCase() : 'TOTAL'}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="category-legend-list">
          {categories.length === 0 ? (
            <div className="category-empty-state">
              No completed quests yet.
            </div>
          ) : (
            categories.map((cat) => {
              const isHovered = hoveredCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`category-legend-row ${isHovered ? 'is-hovered' : ''}`}
                  style={{
                    backgroundColor: isHovered ? `${cat.color}18` : 'transparent',
                    border: isHovered ? `1px solid ${cat.color}45` : '1px solid transparent',
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
                    <span style={{ color: isHovered ? '#ffffff' : '#cbd5e1', fontWeight: isHovered ? 600 : 500 }}>
                      {cat.name} ({cat.count})
                    </span>
                  </div>
                  <span className="category-percentage mono-numbers" style={{ color: isHovered ? cat.color : '#f1f5f9' }}>
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
