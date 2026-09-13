import React, { useState, useMemo } from 'react';
import { BarChart3, Check, AlertCircle, Clock } from 'lucide-react';
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
  status: 'overdue' | 'done' | 'pending';
  rawDate?: Date;
}

export const AccountabilityMatrix: React.FC<AccountabilityMatrixProps> = ({ tasks = [] }) => {
  const [activeFilter, setActiveFilter] = useState<MatrixFilter>('all');

  // Convert ONLY real user tasks into matrix rows — zero fake or pre-made seed data
  const rows: MatrixRowItem[] = useMemo(() => {
    const now = new Date();
    return tasks.map((t) => {
      const isDone = t.completed;
      const isOverdue = !isDone && t.dueDate ? new Date(t.dueDate) < now : false;
      const status: 'overdue' | 'done' | 'pending' = isDone
        ? 'done'
        : isOverdue
          ? 'overdue'
          : 'pending';

      // Map disciplines/categories to labels and colors
      let catName = t.categoryKey || 'General';
      let catColor = '#f59e0b';

      const lowerKey = t.categoryKey?.toLowerCase();
      if (lowerKey === 'intellect') {
        catName = 'Imp. Work';
        catColor = '#3b82f6';
      } else if (lowerKey === 'wisdom') {
        catName = 'Learning';
        catColor = '#38bdf8';
      } else if (lowerKey === 'vitality' || lowerKey === 'personal') {
        catName = 'Personal';
        catColor = '#a855f7';
      } else if (lowerKey === 'strength') {
        catName = 'Strength';
        catColor = '#ef4444';
      } else if (lowerKey === 'charisma') {
        catName = 'Social';
        catColor = '#8b5cf6';
      } else {
        catName = t.categoryKey.charAt(0).toUpperCase() + t.categoryKey.slice(1);
      }

      // Format Due Date
      let dueFormatted = '—';
      if (t.dueDate) {
        const dueDateObj = new Date(t.dueDate);
        const diffMs = now.getTime() - dueDateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          dueFormatted = 'Today';
        } else if (diffDays === 1) {
          dueFormatted = '1 day ago';
        } else if (diffDays > 1 && diffDays <= 14) {
          dueFormatted = `${diffDays} days ago`;
        } else {
          dueFormatted = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }

      // Format Completed Date
      let completedFormatted = '—';
      if (t.completed && t.completedAt) {
        const compDateObj = new Date(t.completedAt);
        const diffMs = now.getTime() - compDateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          completedFormatted = 'Today';
        } else if (diffDays === 1) {
          completedFormatted = '1 day ago';
        } else if (diffDays > 1 && diffDays <= 14) {
          completedFormatted = `${diffDays} days ago`;
        } else {
          completedFormatted = compDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } else if (t.completed) {
        completedFormatted = 'Done';
      }

      return {
        id: t.id,
        name: t.title,
        category: catName,
        categoryColor: catColor,
        dueDate: dueFormatted,
        completedAt: completedFormatted,
        status,
        rawDate: t.createdAt ? new Date(t.createdAt) : t.dueDate ? new Date(t.dueDate) : now,
      };
    });
  }, [tasks]);

  // Apply filters strictly to the user's real tasks
  const filteredRows = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return rows.filter((row) => {
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
  }, [rows, activeFilter]);

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
        {filteredRows.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-tertiary, #64748b)',
              fontSize: '0.9rem',
            }}
          >
            {activeFilter === 'failures'
              ? 'No failed or overdue quests found. Excellent discipline!'
              : 'No quests recorded yet. Create quests from the Quests page to track your accountability matrix.'}
          </div>
        ) : (
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
                      {row.status === 'overdue' && (
                        <span className="matrix-status-pill overdue">
                          <AlertCircle size={12} fill="#ef4444" stroke="#121824" />
                          <span>Overdue / Failed</span>
                        </span>
                      )}
                      {row.status === 'done' && (
                        <span className="matrix-status-pill done">
                          <Check size={13} strokeWidth={3} />
                          <span>Done</span>
                        </span>
                      )}
                      {row.status === 'pending' && (
                        <span
                          className="matrix-status-pill"
                          style={{
                            backgroundColor: 'rgba(56, 189, 248, 0.12)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                          }}
                        >
                          <Clock size={12} />
                          <span>In Progress</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
