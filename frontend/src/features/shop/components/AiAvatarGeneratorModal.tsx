import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Wand2, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { avatarApi } from '../../../services/api/avatar';
import { useAuth } from '../../../context/useAuth';
import { useShop } from '../../../context/useShop';
import type { GenerateAvatarResponse } from '../../../types/contract';

interface AiAvatarGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (avatarUrl: string) => void;
}

interface ArchetypeOption {
  id: string;
  name: string;
  color: string;
  glow: string;
  defaultPrompt: string;
}

const ARCHETYPES: ArchetypeOption[] = [
  {
    id: 'cyber_ninja',
    name: 'Cyber Ninja',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.4)',
    defaultPrompt: 'Stealth cybernetic operative with electric cyan visor and nano-mesh hood',
  },
  {
    id: 'void_knight',
    name: 'Void Knight',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    defaultPrompt: 'Cosmic warrior clad in obsidian plate etched with glowing violet runes',
  },
  {
    id: 'arcane_mage',
    name: 'Arcane Archmage',
    color: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.4)',
    defaultPrompt: 'Master of celestial circuits bathed in starlight illumination and hovering runes',
  },
  {
    id: 'phoenix_warrior',
    name: 'Phoenix Warrior',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.4)',
    defaultPrompt: 'Solar champion radiating molten gold wings and unyielding blazing resolve',
  },
  {
    id: 'celestial_valkyrie',
    name: 'Celestial Valkyrie',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
    defaultPrompt: 'Divine protector with radiant halo crown, wings of pure solar energy, and silver crest',
  },
  {
    id: 'iron_sentinel',
    name: 'Iron Sentinel',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    defaultPrompt: 'Titanium cybernetic juggernaut with fortified hazard blast visor and reinforced armor',
  },
];

const PRESET_IDEAS = [
  'Futuristic street samurai with neon dual blades and glowing red eyes',
  'Interstellar astral pilot with holographic visor and starfield jacket',
  'Steampunk chronomancer with brass clockwork gears and cyan lightning',
  'Cyberpunk cyber-cat rogue with neon emerald whiskers and stealth cowl',
];

export const AiAvatarGeneratorModal: React.FC<AiAvatarGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { setEquippedAvatar } = useAuth();
  const { loadShop, loadInventory } = useShop();

  const [selectedArchetype, setSelectedArchetype] = useState<string>('cyber_ninja');
  const [prompt, setPrompt] = useState<string>(ARCHETYPES[0].defaultPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GenerateAvatarResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleArchetypeSelect = (arch: ArchetypeOption) => {
    setSelectedArchetype(arch.id);
    setPrompt(arch.defaultPrompt);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your avatar.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedResult(null);

    // Micro-phase status progression
    setStatusMessage('Transmitting neural prompt to Gemini...');
    const t1 = setTimeout(() => setStatusMessage('Synthesizing high-definition quantum pixels...'), 1200);
    const t2 = setTimeout(() => setStatusMessage('Inscribing adventurer identity to the Citadel armory...'), 2400);

    try {
      const response = await avatarApi.generateAvatar({
        prompt: prompt.trim(),
        archetype: selectedArchetype,
        styleCategory: 'cyberpunk',
      });

      clearTimeout(t1);
      clearTimeout(t2);

      setGeneratedResult(response);

      // Instantly synchronize the new avatar with AuthContext
      if (response.avatarUrl && setEquippedAvatar) {
        setEquippedAvatar(response.avatarUrl);
      }

      // Re-hydrate shop catalog and inventory to show the newly minted item
      void loadShop();
      void loadInventory();

      if (onSuccess && response.avatarUrl) {
        onSuccess(response.avatarUrl);
      }
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setError(err?.message || 'Failed to synthesize avatar. Please try again.');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div 
      className="armory-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        className="armory-modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          color: '#f8fafc',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close neural forge modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            padding: '0.4rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>
              Neural Forge: AI Avatar Synthesis
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
              Synthesize a unique, high-definition character avatar using Google Gemini intelligence.
            </p>
          </div>
        </div>

        {/* Generated Result View */}
        {generatedResult ? (
          <div
            style={{
              textAlign: 'center',
              padding: '1.5rem',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                width: '140px',
                height: '140px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                padding: '4px',
                background: 'linear-gradient(135deg, #00f0ff, #a855f7, #f59e0b)',
                boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
              }}
            >
              <img
                src={generatedResult.avatarUrl}
                alt="Generated Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  backgroundColor: '#030712',
                }}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} />
              LEGENDARY AVATAR SYNTHESIZED
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0' }}>
              {generatedResult.avatar?.name || 'Custom Citadel Avatar'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1.25rem' }}>
              Equipped to your adventurer profile across all Citadel interfaces!
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setGeneratedResult(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <RefreshCw size={14} />
                Forge Another
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                }}
              >
                <Check size={16} />
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Archetype Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Core Archetype
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {ARCHETYPES.map(arch => {
                  const isSelected = selectedArchetype === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => handleArchetypeSelect(arch)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `1.5px solid ${arch.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#f8fafc' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 0 12px ${arch.glow}` : 'none',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: arch.color,
                          display: 'inline-block',
                          boxShadow: `0 0 6px ${arch.color}`,
                        }}
                      />
                      <span>{arch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Prompt Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Avatar Prompt & Details
              </label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={3}
                placeholder="Describe your character's gear, helm, runes, colors, and cybernetic features..."
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(3, 7, 18, 0.65)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Prompt Ideas Chips */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                Prompt Inspiration (Click to load):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {PRESET_IDEAS.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    disabled={isGenerating}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    + {idea.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.78rem' }}>
                <Cpu size={14} color="#38bdf8" />
                <span>Instant Auto-Equip to Identity</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isGenerating}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  style={{
                    padding: '0.55rem 1.35rem',
                    borderRadius: '8px',
                    background: isGenerating
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'linear-gradient(135deg, #0284c7, #0369a1)',
                    border: '1px solid #38bdf8',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{statusMessage || 'Synthesizing...'}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      <span>Forge Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
