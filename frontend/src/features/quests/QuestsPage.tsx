import React, { useState, useEffect } from 'react';
import { useQuests } from '../../context/useQuests';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import type { Task, CreateTaskRequest } from '../../types/contract';
import { QuestList } from './QuestList';
import { QuestComposerModal } from './QuestComposerModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { RewardToast } from '../../components/common/RewardToast';
import { LevelUpOverlay } from '../../components/common/LevelUpOverlay';
import { 
  Scroll, 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export const QuestsPage: React.FC = () => {
  useDocumentMetadata('Quest Board', { noindex: true });

  const { isGuest } = useAuth();
  const {
    tasks,
    isLoading,
    error,
    pendingTaskIds,
    lastRewardNotice,
    clearRewardNotice,
    levelUpEvent,
    clearLevelUpEvent,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  } = useQuests();

  // Modal states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Stats calculation
  const totalCount = tasks.length;
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsComposerOpen(true);
  };

  // Global hotkey: "C" opens quest composer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'c' || e.key === 'C') &&
        !isComposerOpen &&
        !deletingTask &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        handleOpenCreate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isComposerOpen, deletingTask]);

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsComposerOpen(true);
  };

  const handleComposerSubmit = async (data: CreateTaskRequest) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  };

  const handleOpenDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Reward Toast */}
      {lastRewardNotice && (
        <div className="reward-toast-container">
          <RewardToast reward={lastRewardNotice} onDismiss={clearRewardNotice} />
        </div>
      )}

      {/* Level-Up Overlay */}
      {levelUpEvent && (
        <LevelUpOverlay event={levelUpEvent} onDismiss={clearLevelUpEvent} />
      )}

      {/* Guest Mode Notice */}
      {isGuest && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fef08a',
            fontSize: '0.875rem',
            lineHeight: 1.4,
          }}
        >
          <Sparkles size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <strong>Guest Mode:</strong> You are exploring as a guest traveler. Your quests and RPG stats are stored locally in your browser and will not be saved to the database.
          </div>
        </div>
      )}

      {/* Top Banner & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(56, 189, 248, 0.12) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <Scroll size={13} /> Active Campaign Ledger
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Quest Board &amp; Task Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', fontSize: '1rem', lineHeight: 1.5 }}>
            Formulate, execute, and conquer daily trials. Every completed quest invokes authoritative server progression with verified XP and Gold yields.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="rpg-btn rpg-btn-primary"
          style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          id="btn-open-new-quest"
        >
          <Plus size={18} /> New Quest
        </button>
      </div>

      {/* Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="rpg-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={20} color="#38bdf8" />
          </div>
          <div>
            <div className="rpg-label">Total Quests</div>
            <div className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              {totalCount}
            </div>
          </div>
        </div>

        <div className="rpg-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={20} color="#f59e0b" />
          </div>
          <div>
            <div className="rpg-label">Active Trials</div>
            <div className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fef08a' }}>
              {activeCount}
            </div>
          </div>
        </div>

        <div className="rpg-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <div className="rpg-label">Victories Claimed</div>
            <div className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#86efac' }}>
              {completedCount}
            </div>
          </div>
        </div>

        <div className="rpg-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="#a855f7" />
          </div>
          <div>
            <div className="rpg-label">Completion Rate</div>
            <div className="mono-numbers" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d8b4fe' }}>
              {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : '0%'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Quest List (handles search, discipline filters, empty states, loading skeletons, error banner) */}
      <QuestList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        pendingTaskIds={pendingTaskIds}
        lastRewardNotice={lastRewardNotice}
        onComplete={completeTask}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onCreate={handleOpenCreate}
        onRetry={loadTasks}
      />

      {/* Quest Composer (Create / Edit) Modal */}
      <QuestComposerModal
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleComposerSubmit}
        editingTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
