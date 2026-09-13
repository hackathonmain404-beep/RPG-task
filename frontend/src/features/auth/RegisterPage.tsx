import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

const ARCHETYPES = [
  { key: 'intellect', label: 'Scholar', discipline: 'Intellect Focus', icon: '🧠', color: 'var(--attr-intellect)' },
  { key: 'strength', label: 'Warrior', discipline: 'Strength Focus', icon: '⚔️', color: 'var(--attr-strength)' },
  { key: 'wisdom', label: 'Sage', discipline: 'Wisdom Focus', icon: '📖', color: 'var(--attr-wisdom)' },
  { key: 'charisma', label: 'Diplomat', discipline: 'Charisma Focus', icon: '✨', color: 'var(--attr-charisma)' },
  { key: 'vitality', label: 'Guardian', discipline: 'Vitality Focus', icon: '❤️', color: 'var(--attr-vitality)' },
];

export const RegisterPage: React.FC = () => {
  useDocumentMetadata('Forge Character', {
    description: 'Create your Life RPG adventurer account and choose your starting discipline.',
    noindex: false,
  });

  const { signInWithGoogle, signInWithGithub, serverReachable, checkServerReachability } = useAuth();

  const [starterDiscipline, setStarterDiscipline] = useState('intellect');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingReachability, setIsCheckingReachability] = useState(false);

  // Auto-probe backend reachability when register page mounts
  useEffect(() => {
    if (!serverReachable && checkServerReachability) {
      void checkServerReachability();
    }
  }, [serverReachable, checkServerReachability]);

  const handleRetryReachability = async () => {
    if (!checkServerReachability) return;
    setIsCheckingReachability(true);
    try {
      await checkServerReachability();
    } finally {
      setIsCheckingReachability(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google.';
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  const handleGithubSignIn = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signInWithGithub();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with GitHub.';
      setErrorMsg(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1.25rem, 3vw, 2.5rem) clamp(0.75rem, 2.5vw, 1.5rem)',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} aria-label="Achiever Home">
          <img
            src="/achiever-logo.png"
            alt="Achiever Logo"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 0 18px rgba(56, 189, 248, 0.45)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: '0.04em',
              background: 'linear-gradient(90deg, #f8fafc, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Achiever
          </span>
        </Link>
      </div>

      <div
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: 'min(480px, 94vw)',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: 'var(--color-xp)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={12} /> Character Forge
          </div>
          <h1 style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', marginBottom: '0.35rem' }}>Create Your Adventurer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Choose your starter discipline, then sign in to forge your character.
          </p>
        </div>

        {/* Server Status Notice */}
        {!serverReachable && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fde047',
              fontSize: '0.85rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            role="status"
          >
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Citadel Backend Offline:</strong> The backend API is currently not detected.
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetryReachability}
              disabled={isCheckingReachability}
              style={{
                flexShrink: 0,
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.18)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fde047',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: isCheckingReachability ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={12} style={{ animation: isCheckingReachability ? 'spin 1s linear infinite' : 'none' }} />
              {isCheckingReachability ? 'Testing...' : 'Retry'}
            </button>
          </div>
        )}

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
            id="register-error"
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Starter Archetype Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="rpg-label">Starter Focus Discipline</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {ARCHETYPES.map(arch => {
              const isSelected = starterDiscipline === arch.key;
              return (
                <button
                  type="button"
                  key={arch.key}
                  onClick={() => setStarterDiscipline(arch.key)}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-sunken)',
                    border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all var(--duration-fast) ease',
                  }}
                  aria-pressed={isSelected}
                >
                  <span style={{ fontSize: '1.25rem' }}>{arch.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{arch.label}</span>
                  <span style={{ fontSize: '0.65rem', color: isSelected ? '#38bdf8' : 'var(--text-tertiary)' }}>
                    {arch.discipline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            color: 'var(--text-tertiary)',
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <span>sign in to forge character</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGoogleSignIn}
          className="rpg-btn"
          id="register-google"
          style={{
            width: '100%',
            padding: '0.85rem',
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f0f6fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg height="20" width="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* GitHub Sign In */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleGithubSignIn}
          className="rpg-btn"
          id="register-github"
          style={{
            width: '100%',
            padding: '0.85rem',
            marginBottom: '0',
            fontSize: '0.95rem',
            fontWeight: 600,
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            color: '#f0f6fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>Continue with GitHub</span>
        </button>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          Already an active adventurer?{' '}
          <Link
            to="/login"
            style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}
          >
            Enter Citadel
          </Link>
        </div>

        {/* Legal Links */}
        <div
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Link to="/privacy" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            Privacy
          </Link>
          <span>·</span>
          <Link to="/terms" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            Terms
          </Link>
          <span>·</span>
          <Link to="/accessibility" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
            Accessibility
          </Link>
        </div>
      </div>
    </div>
  );
};
