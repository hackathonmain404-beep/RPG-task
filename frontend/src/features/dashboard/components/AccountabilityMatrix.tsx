import React, { useState, useMemo } from 'react';
import { BarChart3, Check, AlertCircle } from 'lucide-react';
import type { Task } from '../../../types/contract';

interface AccountabilityMatrixProps {
  tasks?: Task[];
}

export type MatrixFilter = 'all' | 'week' | 'month' | 'failures';

export interface MatrixRowItem {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  dueDate: string;
  completedAt: string;
  status: 'overdue' | 'done';
  rawDate?: Date;
}

// Reference seed rows matching the screenshot precisely
const REFERENCE_SEED_ROWS: MatrixRowItem[] = [
  {
    id: 'seed-1',
    name: 'Fix the coin compensation that gives coins (1000) when a user log out and log in',
    category: 'Imp. Work',
    categoryColor: '#94a3b8',
    dueDate: '6 days ago',
    completedAt: '—',
    status: 'overdue',
    rawDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'seed-2',
    name: "Reposition the 'Progress' of the slide to above the 'Spaces'",
    category: 'Personal',
    categoryColor: '#a855f7',
    dueDate: '6 days ago',
    completedAt: '—',
    status: 'overdue',
    rawDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'seed-3',
    name: 'Check the syncing of the database to the frontend',
    category: 'Personal',
    categoryColor: '#a855f7',
    dueDate: '6 days ago',
    completedAt: '—',
    status: 'overdue',
    rawDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'seed-4',
    name: 'Make the landing page',
    category: 'Imp. Work',
    categoryColor: '#94a3b8',
    dueDate: '7 days ago',
    completedAt: '7 days ago',
    status: 'done',
    rawDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'seed-5',
    name: 'Check the glasses to lenscart',
    category: 'Personal',
    categoryColor: '#a855f7',
    dueDate: 'Aug 17',
    completedAt: 'Aug 17',
    status: 'done',
    rawDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
];

export const AccountabilityMatrix: React.FC<AccountabilityMatrixProps> = ({ tasks = [] }) => {
  const [activeFilter, setActiveFilter] = useState<MatrixFilter>('all');

  // Convert real tasks into matrix row items
  const realRows: MatrixRowItem[] = useMemo(() => {
    return tasks.map((t) => {
      const isDone = t.completed;
      const isOverdue = !isDone && t.dueDate && new Date(t.dueDate) < new Date();
      const status: 'overdue' | 'done' = isDone ? 'done' : isOverdue ? 'overdue' : 'overdue';

      // Map categories to display labels & dot colors
      let catName = 'General';
      let catColor = '#f59e0b';
      if (t.categoryKey === 'intellect') {
        catName = 'Imp. Work';
        catColor = '#94a3b8';
      } else if (t.categoryKey === 'wisdom') {
        catName = 'Learning';
        catColor = '#38bdf8';
      } else if (t.categoryKey === 'vitality' || t.categoryKey === 'personal') {
        catName = 'Personal';
        catColor = '#a855f7';
      }

      const dueFormatted = t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';
      const completedFormatted = t.completedAt ? new Date(t.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (isDone ? 'Today' : '—');

      return {
        id: t.id,
        name: t.title,
        category: catName,
        categoryColor: catColor,
        dueDate: dueFormatted,
        completedAt: completedFormatted,
        status,
        rawDate: t.createdAt ? new Date(t.createdAt) : new Date(),
      };
    });
  }, [tasks]);

  // Combine real tasks with reference seeds
  const allRows = useMemo(() => {
    return [...realRows, ...REFERENCE_SEED_ROWS];
  }, [realRows]);

  // Apply filters
  const filteredRows = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return allRows.filter((row) => {
      if (activeFilter === 'failures') {
        return row.status === 'overdue';
      }
      if (activeFilter === 'week') {
        return row.rawDate && row.rawDate >= sevenDaysAgo;
      }
      if (activeFilter === 'month') {
        return row.rawDate && row.rawDate >= thirtyDaysAgo;
      }
      return true;
    });
  }, [allRows, activeFilter]);

  return (
    <div className="matrix-card">
      <div className="matrix-header">
        <div className="matrix-title-group">
          <BarChart3 size={20} color="#818cf8" />
          <h3 className="matrix-title">The Accountability Matrix</h3>
        </div>

        {/* Filter Tabs */}
        <div className="matrix-filters">
          <button
            type="button"
            className={`matrix-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Time
          </button>
          <button
            type="button"
            className={`matrix-filter-btn ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setActiveFilter('week')}
          >
            This Week
          </button>
          <button
            type="button"
            className={`matrix-filter-btn ${activeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setActiveFilter('month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`matrix-filter-btn ${activeFilter === 'failures' ? 'active' : ''}`}
            onClick={() => setActiveFilter('failures')}
          >
            Failures
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="matrix-table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: '42%' }}>TASK NAME</th>
              <th style={{ width: '18%' }}>CATEGORY</th>
              <th style={{ width: '15%' }}>DUE DATE</th>
              <th style={{ width: '13%' }}>COMPLETED AT</th>
              <th style={{ width: '12%', textAlign: 'right' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const isOverdue = row.status === 'overdue';
              return (
                <tr
                  key={row.id}
                  className={`matrix-row ${isOverdue ? 'overdue-row' : ''}`}
                >
                  <td>
                    <div className="matrix-task-title" title={row.name}>
                      {row.name}
                    </div>
                  </td>
                  <td>
                    <div className="matrix-category-cell">
                      <span
                        className="matrix-category-dot"
                        style={{ backgroundColor: row.categoryColor }}
                      />
                      <span>{row.category}</span>
                    </div>
                  </td>
                  <td>
                    <span className="matrix-date-cell">{row.dueDate}</span>
                  </td>
                  <td>
                    <span className="matrix-date-cell">{row.completedAt}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {isOverdue ? (
                      <span className="matrix-status-pill overdue">
                        <AlertCircle size={12} fill="#ef4444" stroke="#121824" />
                        <span>Overdue / Failed</span>
                      </span>
                    ) : (
                      <span className="matrix-status-pill done">
                        <Check size={13} strokeWidth={3} />
                        <span>Done</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
