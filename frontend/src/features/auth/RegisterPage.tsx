import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { ApiError } from '../../types/contract';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

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

  const { register, loginWithGithub, serverReachable } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [starterDiscipline, setStarterDiscipline] = useState('intellect');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim()) {
      setErrorMsg('Please choose an adventurer display name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Master key must be at least 6 characters in length.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        starterDiscipline,
      });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'EMAIL_ALREADY_EXISTS' || err.status === 409) {
          setErrorMsg('An adventurer with this email already exists in the Citadel.');
        } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          setErrorMsg('Unable to connect to Citadel server. Please ensure the backend server is running.');
        } else {
          setErrorMsg(err.message || 'Registration failed.');
        }
      } else {
        setErrorMsg('An unexpected error occurred during character creation.');
      }
    } finally {
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
        padding: '2.5rem 1.5rem',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
            }}
          >
            <Shield size={24} color="#38bdf8" />
          </div>
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
            LIFE RPG
          </span>
        </Link>
      </div>

      <div
        className="rpg-card"
        style={{
          width: '100%',
          maxWidth: '480px',
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
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Your Adventurer</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Initialize your permanent progression in the PostgreSQL Citadel.
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
              gap: '0.65rem',
              alignItems: 'flex-start',
            }}
            role="status"
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Citadel Backend Offline:</strong> The backend API at <code>http://localhost:3000</code> is currently not detected.
            </div>
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

        {/* 1-Click GitHub Registration */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={async () => {
            const ghUsername = prompt('Enter your GitHub username to create and embark:');
            if (!ghUsername || !ghUsername.trim()) return;
            setIsSubmitting(true);
            setErrorMsg(null);
            try {
              if (loginWithGithub) {
                await loginWithGithub({ githubUsername: ghUsername.trim() });
                navigate('/app/dashboard', { replace: true });
              }
            } catch (err: any) {
              setErrorMsg(err?.message || 'Failed to authenticate with GitHub.');
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="rpg-btn"
          style={{
            width: '100%',
            padding: '0.85rem',
            marginBottom: '1.25rem',
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
          <span>or forge character below</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Display Name */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label htmlFor="reg-name" className="rpg-label">
              Adventurer Title / Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-name"
                type="text"
                required
                autoFocus
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="rpg-input"
                placeholder="e.g. Valkyrie, CodeScribe"
                disabled={isSubmitting}
                style={{ paddingLeft: '2.5rem' }}
              />
              <User
                size={18}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label htmlFor="reg-email" className="rpg-label">
              Citadel Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rpg-input"
                placeholder="adventurer@example.com"
                disabled={isSubmitting}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={18}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="reg-pass" className="rpg-label">
              Master Key (Password)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-pass"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rpg-input"
                placeholder="Min 6 characters"
                disabled={isSubmitting}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={18}
                color="var(--text-tertiary)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Starter Archetype Selector */}
          <div style={{ marginBottom: '1.75rem' }}>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="rpg-btn rpg-btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Forging Character...' : 'Forge Character & Embark'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

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
      </div>
    </div>
  );
};
