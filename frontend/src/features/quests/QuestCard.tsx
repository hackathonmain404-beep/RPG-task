import React from 'react';
import type { Task } from '../../types/contract';
import { 
  Check, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Heart, 
  Calendar, 
  Edit3, 
  Trash2, 
  Loader2 
} from 'lucide-react';

interface QuestCardProps {
  task: Task;
  isPending: boolean;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  showRewardPill?: boolean;
  rewardInfo?: {
    xp?: number;
    gold?: number;
  };
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.FC<{ size?: number; color?: string }>; color: string; bg: string }> = {
  intellect: { label: 'Intellect', icon: Brain, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  strength: { label: 'Strength', icon: Dumbbell, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  wisdom: { label: 'Wisdom', icon: BookOpen, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' },
  charisma: { label: 'Charisma', icon: Sparkles, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  vitality: { label: 'Vitality', icon: Heart, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
};

const DIFFICULTY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Easy', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  medium: { label: 'Medium', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  hard: { label: 'Hard', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  epic: { label: 'Epic', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
};

export const QuestCard: React.FC<QuestCardProps> = ({
  task,
  isPending,
  onComplete,
  onEdit,
  onDelete,
  showRewardPill,
  rewardInfo,
}) => {
  const catKey = (task.categoryKey || 'intellect').toLowerCase();
  const category = CATEGORY_MAP[catKey] || CATEGORY_MAP.intellect;
  const CategoryIcon = category.icon;

  const diffKey = (task.difficulty || 'medium').toLowerCase();
  const difficulty = DIFFICULTY_MAP[diffKey] || DIFFICULTY_MAP.medium;

  const handleCheckboxClick = () => {
    if (!task.completed && !isPending) {
      onComplete(task.id);
    }
  };

  // Format Due Date
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      if (isToday) return 'Today';

      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const dueDateFormatted = formatDueDate(task.dueDate);

  return (
    <div
      className="rpg-card"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        backgroundColor: task.completed ? 'rgba(15, 20, 28, 0.6)' : 'var(--bg-surface)',
        border: task.completed ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid var(--border-subtle)',
        position: 'relative',
        transition: 'all 0.25s ease',
        opacity: task.completed ? 0.75 : 1,
      }}
    >
      {/* Floating Reward Pill */}
      {showRewardPill && rewardInfo && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            right: '16px',
            zIndex: 10,
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            boxShadow: 'var(--glow-gold)',
            color: '#fef08a',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {rewardInfo.xp && <span>+{rewardInfo.xp} XP</span>}
          {rewardInfo.gold && <span>+{rewardInfo.gold} Gold</span>}
        </div>
      )}

      {/* Top Row: Checkbox, Title, and Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
          {/* Accessible Checkbox Button */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={`Mark quest "${task.title}" as ${task.completed ? 'completed' : 'complete'}`}
            onClick={handleCheckboxClick}
            disabled={task.completed || isPending}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: task.completed
                ? '#10b981'
                : isPending
                ? 'var(--bg-surface-sunken)'
                : 'var(--bg-surface-sunken)',
              border: task.completed
                ? '1px solid #10b981'
                : '2px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: task.completed ? 'default' : isPending ? 'wait' : 'pointer',
              flexShrink: 0,
              marginTop: '2px',
              transition: 'all 0.15s ease',
              boxShadow: task.completed ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
            }}
          >
            {isPending ? (
              <Loader2 size={14} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
            ) : task.completed ? (
              <Check size={16} color="#090c10" strokeWidth={3} />
            ) : null}
          </button>

          {/* Title & Description */}
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                textDecoration: task.completed ? 'line-through' : 'none',
                lineHeight: 1.35,
                wordBreak: 'break-word',
              }}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.35rem',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Edit & Delete Action Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={isPending}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.35rem', borderRadius: '6px', border: 'none' }}
            aria-label={`Edit quest ${task.title}`}
          >
            <Edit3 size={15} color="var(--text-secondary)" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            disabled={isPending}
            className="rpg-btn rpg-btn-danger"
            style={{ padding: '0.35rem', borderRadius: '6px', border: 'none' }}
            aria-label={`Abandon quest ${task.title}`}
          >
            <Trash2 size={15} color="#fca5a5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Metadata Badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap',
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          fontSize: '0.75rem',
        }}
      >
        {/* Category Discipline Badge */}
        <span
          className="rpg-badge"
          style={{
            backgroundColor: category.bg,
            color: category.color,
            border: `1px solid ${category.color}35`,
          }}
        >
          <CategoryIcon size={12} color={category.color} />
          <span>{category.label}</span>
        </span>

        {/* Difficulty Badge */}
        <span
          className="rpg-badge"
          style={{
            backgroundColor: difficulty.bg,
            color: difficulty.color,
            border: `1px solid ${difficulty.color}35`,
          }}
        >
          {difficulty.label}
        </span>

        {/* Due Date Badge if present */}
        {dueDateFormatted && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--text-tertiary)',
            }}
          >
            <Calendar size={13} />
            <span>Due {dueDateFormatted}</span>
          </span>
        )}

        {/* Completion status tag */}
        {task.completed && (
          <span
            className="rpg-badge"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              marginLeft: 'auto',
            }}
          >
            SLAIN
          </span>
        )}
      </div>
    </div>
  );
};
