import React from 'react';
import { Link } from 'react-router-dom';
import { User, ArrowRight, ShieldCheck, Dumbbell, Brain, Heart, Sparkles, BookOpen } from 'lucide-react';
import type { Character, Attribute } from '../../../types/contract';
import { useAuth } from '../../../context/useAuth';

interface CharacterPreviewCardProps {
  character?: Character | null;
  attributes?: Attribute[];
}

export const CharacterPreviewCard: React.FC<CharacterPreviewCardProps> = ({
  character,
  attributes = [],
}) => {
  const { user } = useAuth();
  const level = character?.level ?? 12;

  // Key attributes map or fallback to realistic default scores
  const getAttrVal = (key: string, fallback: number) => {
    const found = attributes.find(a => a.key.toLowerCase() === key.toLowerCase());
    return found ? (found.value > 0 ? found.value : fallback) : fallback;
  };

  const str = getAttrVal('strength', 72);
  const intVal = getAttrVal('intellect', 91);
  const vit = getAttrVal('vitality', 64);
  const wis = getAttrVal('wisdom', 80);
  const cha = getAttrVal('charisma', 55);

  return (
    <div className="character-preview-card rpg-card">
      <div className="character-card-header">
        <div className="section-title-with-icon">
          <span className="character-header-emoji">🧙</span>
          <h3 className="section-card-title">YOUR CHARACTER</h3>
        </div>

        <Link to="/app/character" className="character-sheet-cta-link">
          <span>Character</span>
          <ArrowRight size={14} className="char-arrow" />
        </Link>
      </div>

      {/* Avatar HUD representation */}
      <div className="character-hud-hero">
        <div className="avatar-frame-hex">
          <div className="avatar-inner-glow" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'Hero'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={34} className="avatar-user-glyph" />
            )}
          </div>
          <div className="avatar-level-badge mono-numbers">
            Lv.{level}
          </div>
        </div>

        <div className="character-hero-titles">
          <div className="character-archetype-tag">
            <ShieldCheck size={13} />
            <span>DISCIPLINE ARCHETYPE</span>
          </div>
          <h4 className="character-title-heading">
            LEVEL {level} ADVENTURER
          </h4>
          <span className="character-status-caption">
            Real-world effort mapped to cybernetic RPG attributes.
          </span>
        </div>
      </div>

      {/* Attributes Bar Grid */}
      <div className="character-attributes-list">
        {/* STR */}
        <div className="char-attr-row">
          <div className="char-attr-left">
            <Dumbbell size={14} className="attr-icon-strength" />
            <span className="char-attr-name">STR</span>
          </div>
          <div className="rpg-progress-track char-attr-track" role="progressbar" aria-valuenow={str} aria-valuemin={0} aria-valuemax={100}>
            <div className="rpg-progress-fill attr-fill-strength" style={{ width: `${Math.min(100, str)}%` }} />
          </div>
          <span className="char-attr-score mono-numbers">{str}</span>
        </div>

        {/* INT */}
        <div className="char-attr-row">
          <div className="char-attr-left">
            <Brain size={14} className="attr-icon-intellect" />
            <span className="char-attr-name">INT</span>
          </div>
          <div className="rpg-progress-track char-attr-track" role="progressbar" aria-valuenow={intVal} aria-valuemin={0} aria-valuemax={100}>
            <div className="rpg-progress-fill attr-fill-intellect" style={{ width: `${Math.min(100, intVal)}%` }} />
          </div>
          <span className="char-attr-score mono-numbers">{intVal}</span>
        </div>

        {/* VIT */}
        <div className="char-attr-row">
          <div className="char-attr-left">
            <Heart size={14} className="attr-icon-vitality" />
            <span className="char-attr-name">VIT</span>
          </div>
          <div className="rpg-progress-track char-attr-track" role="progressbar" aria-valuenow={vit} aria-valuemin={0} aria-valuemax={100}>
            <div className="rpg-progress-fill attr-fill-vitality" style={{ width: `${Math.min(100, vit)}%` }} />
          </div>
          <span className="char-attr-score mono-numbers">{vit}</span>
        </div>

        {/* Supplementary WIS & CHA in compact row */}
        <div className="char-attr-dual-sub">
          <div className="sub-attr-pill">
            <BookOpen size={12} color="#14b8a6" />
            <span>WIS <strong className="mono-numbers">{wis}</strong></span>
          </div>
          <div className="sub-attr-pill">
            <Sparkles size={12} color="#a855f7" />
            <span>CHA <strong className="mono-numbers">{cha}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
