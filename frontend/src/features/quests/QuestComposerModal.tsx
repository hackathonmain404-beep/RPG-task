import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Task, CreateTaskRequest, DisciplineKey, DifficultyLevel } from '../../types/contract';
import { CustomSelect } from '../../components/common/CustomSelect';
import { 
  X, 
  Brain, 
  Dumbbell, 
  BookOpen, 
  Sparkles, 
  Heart, 
  Calendar, 
  AlertCircle, 
  Scroll 
} from 'lucide-react';

interface QuestComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskRequest) => Promise<void>;
  editingTask?: Task | null;
}

const DISCIPLINES: Array<{ key: DisciplineKey; label: string; icon: React.FC<{ size?: number; color?: string }>; color: string }> = [
  { key: 'intellect', label: 'Intellect (Logic & Tech)', icon: Brain, color: '#3b82f6' },
  { key: 'strength', label: 'Strength (Fitness & Body)', icon: Dumbbell, color: '#ef4444' },
  { key: 'wisdom', label: 'Wisdom (Study & Reading)', icon: BookOpen, color: '#14b8a6' },
  { key: 'charisma', label: 'Charisma (Social & Team)', icon: Sparkles, color: '#8b5cf6' },
  { key: 'vitality', label: 'Vitality (Health & Sleep)', icon: Heart, color: '#10b981' },
];

const DIFFICULTIES: Array<{ key: DifficultyLevel; label: string; tier: string; color: string }> = [
  { key: 'easy', label: 'Easy', tier: 'Minor Effort', color: '#10b981' },
  { key: 'medium', label: 'Medium', tier: 'Standard Focus', color: '#38bdf8' },
  { key: 'hard', label: 'Hard', tier: 'Intense Trial', color: '#f59e0b' },
  { key: 'epic', label: 'Epic', tier: 'Major Conquest', color: '#a855f7' },
];

const QuestComposerDialog: React.FC<Omit<QuestComposerModalProps, 'isOpen'>> = ({
  onClose,
  onSubmit,
  editingTask,
}) => {
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [categoryKey, setCategoryKey] = useState<DisciplineKey>(editingTask?.categoryKey ?? 'intellect');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(editingTask?.difficulty ?? 'medium');
  const [dueDate, setDueDate] = useState(
    editingTask?.dueDate ? editingTask.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Handle Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Quest title cannot be empty.');
      return;
    }
    if (cleanTitle.length > 100) {
      setErrorMsg('Quest title cannot exceed 100 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: cleanTitle,
        description: description.trim() || undefined,
        categoryKey,
        difficulty,
        dueDate: dueDate || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register quest with server.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop-anim"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-modal-title"
    >
      <div
        className="rpg-card modal-card-anim"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: 'min(90vh, 720px)',
          overflowY: 'auto',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.15)',
          padding: 'clamp(1.25rem, 3.5vw, 2rem)',
          position: 'relative',
          borderRadius: '16px',
          backgroundColor: '#0c1017',
          margin: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scroll size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 id="composer-modal-title" style={{ fontSize: '1.35rem' }}>
                {editingTask ? 'Modify Quest' : 'Forge a New Quest'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {editingTask ? 'Update your active objective' : 'Record a goal in the Citadel task log'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rpg-btn rpg-btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '8px', border: 'none' }}
            aria-label="Close quest composer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
            role="alert"
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="quest-title" className="rpg-label">
              Quest Objective (Title) *
            </label>
            <input
              id="quest-title"
              ref={titleInputRef}
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="rpg-input"
              placeholder="e.g. Master React hooks & custom reducers"
              disabled={isSubmitting}
            />
          </div>

          {/* Description Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="quest-description" className="rpg-label">
              Tactical Briefing (Description)
            </label>
            <textarea
              id="quest-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="rpg-input"
              placeholder="Optional notes, requirements, or study links..."
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Category / Discipline */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="quest-category" className="rpg-label">
              Trained Discipline (Category) *
            </label>
            <div>
              <CustomSelect<DisciplineKey>
                id="quest-category"
                ariaLabel="Trained Discipline (Category)"
                value={categoryKey}
                onChange={val => setCategoryKey(val)}
                options={DISCIPLINES.map(d => {
                  const IconComp = d.icon;
                  return {
                    value: d.key,
                    label: d.label,
                    icon: <IconComp size={16} color={d.color} />,
                    color: d.color,
                  };
                })}
                disabled={isSubmitting}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
              Category determines which character attribute gains progression upon completion.
            </p>
          </div>

          {/* Difficulty Tier */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="rpg-label">
              Challenge Difficulty *
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))',
                gap: '0.5rem',
                marginTop: '0.35rem',
              }}
              role="radiogroup"
              aria-label="Select challenge difficulty"
            >
              {DIFFICULTIES.map(diff => {
                const isSelected = difficulty === diff.key;
                return (
                  <button
                    key={diff.key}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setDifficulty(diff.key)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-sunken)',
                      border: isSelected ? `2px solid ${diff.color}` : '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? diff.color : 'var(--text-primary)' }}>
                      {diff.label}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                      {diff.tier}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label htmlFor="quest-duedate" className="rpg-label" style={{ margin: 0 }}>
                Due Date (Optional)
              </label>
              {dueDate && (
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                  📅 {new Date(dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="quest-duedate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="rpg-input"
                disabled={isSubmitting}
                style={{
                  colorScheme: 'dark',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  paddingRight: '2.5rem',
                  fontSize: '0.9rem',
                }}
              />
              <Calendar
                size={18}
                color="#38bdf8"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.55rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Today', days: 0 },
                { label: 'Tomorrow', days: 1 },
                { label: '+3 Days', days: 3 },
                { label: '+1 Week', days: 7 },
              ].map(preset => {
                const d = new Date();
                d.setDate(d.getDate() + preset.days);
                const dateStr = d.toISOString().slice(0, 10);
                const isCurrent = dueDate === dateStr;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDueDate(dateStr)}
                    className="rpg-btn"
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: isCurrent ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.12)',
                      background: isCurrent ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      color: isCurrent ? '#38bdf8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    marginLeft: 'auto',
                  }}
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rpg-btn rpg-btn-secondary"
              style={{ minHeight: '42px', padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rpg-btn rpg-btn-primary"
              style={{ minHeight: '42px', padding: '0.65rem 1.25rem' }}
            >
              {isSubmitting
                ? 'Recording...'
                : editingTask
                ? 'Update Quest'
                : 'Embark (Save Quest)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const QuestComposerModal: React.FC<QuestComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
}) => {
  if (!isOpen) return null;

  const content = (
    <QuestComposerDialog
      key={editingTask ? editingTask.id : 'create'}
      onClose={onClose}
      onSubmit={onSubmit}
      editingTask={editingTask}
    />
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

