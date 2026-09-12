import React, { useState, useEffect, useRef } from 'react';
import type { Task, CreateTaskRequest, DisciplineKey, DifficultyLevel } from '../../types/contract';
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-modal-title"
    >
      <div
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          padding: '2rem',
          position: 'relative',
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
            <div style={{ position: 'relative' }}>
              <select
                id="quest-category"
                value={categoryKey}
                onChange={e => setCategoryKey(e.target.value as DisciplineKey)}
                className="rpg-input"
                disabled={isSubmitting}
                style={{ cursor: 'pointer' }}
              >
                {DISCIPLINES.map(d => (
                  <option key={d.key} value={d.key} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                    {d.label}
                  </option>
                ))}
              </select>
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
                gridTemplateColumns: 'repeat(4, 1fr)',
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
            <label htmlFor="quest-duedate" className="rpg-label">
              Due Date (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="quest-duedate"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="rpg-input"
                disabled={isSubmitting}
                style={{ colorScheme: 'dark' }}
              />
              <Calendar
                size={18}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rpg-btn rpg-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rpg-btn rpg-btn-primary"
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

  return (
    <QuestComposerDialog
      key={editingTask ? editingTask.id : 'create'}
      onClose={onClose}
      onSubmit={onSubmit}
      editingTask={editingTask}
    />
  );
};
