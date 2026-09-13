import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Swords, UserCheck } from 'lucide-react';

interface QuickActionsRowProps {
  onCreateQuest: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({ onCreateQuest }) => {
  return (
    <section className="quick-actions-bar" aria-label="Quick Actions">
      <div className="quick-actions-header">
        <span className="quick-actions-title">QUICK ACTIONS</span>
      </div>

      <div className="quick-actions-buttons">
        {/* Primary Action: + Create Quest */}
        <button
          type="button"
          onClick={onCreateQuest}
          className="quick-action-btn primary-action"
          id="quick-action-create-quest"
          aria-label="Create New Quest"
        >
          <Plus size={18} className="qa-icon plus-icon" />
          <span className="qa-label">Create Quest</span>
        </button>

        {/* Action: ⚔ View Quests */}
        <Link
          to="/app/quests"
          className="quick-action-btn secondary-action"
          id="quick-action-view-quests"
          aria-label="View All Quests"
        >
          <Swords size={18} className="qa-icon" />
          <span className="qa-label">View Quests</span>
        </Link>

        {/* Action: 🧙 Character */}
        <Link
          to="/app/character"
          className="quick-action-btn secondary-action"
          id="quick-action-view-character"
          aria-label="View Character Sheet"
        >
          <UserCheck size={18} className="qa-icon" />
          <span className="qa-label">Character</span>
        </Link>
      </div>
    </section>
  );
};
