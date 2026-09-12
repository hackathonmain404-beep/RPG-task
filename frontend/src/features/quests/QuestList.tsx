import React, { useState, useMemo } from 'react';
import type { Task } from '../../types/contract';
import type { RewardNotice } from '../../context/questsContextDef';
import { QuestCard } from './QuestCard';
import { 
  Search, 
  Plus, 
  AlertCircle, 
  RotateCcw, 
  Sparkles,
  Inbox
} from 'lucide-react';

interface QuestListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  pendingTaskIds: Set<string>;
  lastRewardNotice: RewardNotice | null;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreate: () => void;
  onRetry: () => void;
}

const DISCIPLINES = [
  { key: 'all', label: 'All Disciplines' },
  { key: 'intellect', label: '🧠 Intellect' },
  { key: 'strength', label: '⚔️ Strength' },
  { key: 'wisdom', label: '📖 Wisdom' },
  { key: 'charisma', label: '✨ Charisma' },
  { key: 'vitality', label: '❤️ Vitality' },
];

export const QuestList: React.FC<QuestListProps> = ({
  tasks,
  isLoading,
  error,
  pendingTaskIds,
  lastRewardNotice,
  onComplete,
  onEdit,
  onDelete,
  onCreate,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');

  // Filter tasks based on search query, completion status, and discipline
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Status filter
      if (statusFilter === 'active' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;

      // 3. Discipline filter
      if (disciplineFilter !== 'all' && (task.categoryKey || '').toLowerCase() !== disciplineFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, disciplineFilter]);

  const activeCount = useMemo(() => tasks.filter(t => !t.completed).length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls Header: Search & Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search active or completed quests..."
              className="rpg-input"
              style={{ paddingLeft: '2.4rem' }}
              aria-label="Search quests"
            />
            <Search
              size={18}
              color="var(--text-tertiary)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Status Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface-sunken)',
              padding: '0.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
            }}
            role="tablist"
            aria-label="Filter quests by status"
          >
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: statusFilter === 'all' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: statusFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: statusFilter === 'active' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: statusFilter === 'active' ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'completed'}
              onClick={() => setStatusFilter('completed')}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: statusFilter === 'completed' ? 'var(--bg-surface-elevated)' : 'transparent',
                color: statusFilter === 'completed' ? '#10b981' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Discipline Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}
          aria-label="Filter quests by discipline"
        >
          {DISCIPLINES.map(d => {
            const isSelected = disciplineFilter === d.key;
            return (
              <button
                type="button"
                key={d.key}
                onClick={() => setDisciplineFilter(d.key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-sunken)',
                  border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <RotateCcw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} aria-busy="true" aria-label="Loading quests">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="rpg-card"
              style={{
                height: '110px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: 0.6,
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: 'var(--bg-surface-elevated)' }} />
                <div style={{ width: '60%', height: '18px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-elevated)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '80px', height: '22px', borderRadius: '9999px', backgroundColor: 'var(--bg-surface-elevated)' }} />
                <div style={{ width: '60px', height: '22px', borderRadius: '9999px', backgroundColor: 'var(--bg-surface-elevated)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        /* Rendered Quest Stack */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredTasks.map(task => (
            <QuestCard
              key={task.id}
              task={task}
              isPending={pendingTaskIds.has(task.id)}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              showRewardPill={lastRewardNotice?.taskId === task.id}
              rewardInfo={
                lastRewardNotice?.taskId === task.id
                  ? { xp: lastRewardNotice.xp, gold: lastRewardNotice.gold }
                  : undefined
              }
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State A: Zero tasks on board */
        <div
          className="rpg-card"
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px dashed var(--border-strong)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={28} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>The Quest Board is Clear</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            Rest your sword, adventurer. Or formulate a new quest to begin earning XP and building your momentum streak.
          </p>
          <button type="button" onClick={onCreate} className="rpg-btn rpg-btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Plus size={18} /> Forge Your First Quest
          </button>
        </div>
      ) : (
        /* Empty State B: Search/Filter returned 0 results */
        <div
          className="rpg-card"
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Inbox size={32} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>No Quests Match Your Filter</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Try clearing your search query or choosing another discipline tag.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDisciplineFilter('all');
            }}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
