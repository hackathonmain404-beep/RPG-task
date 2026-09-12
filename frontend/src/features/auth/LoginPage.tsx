import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ApiError } from '../../types/contract';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, serverReachable } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'INVALID_CREDENTIALS' || err.status === 401) {
          setErrorMsg('Invalid email or password. Please verify your credentials.');
        } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          setErrorMsg('Unable to connect to Citadel server. Please ensure the backend server is running.');
        } else {
          setErrorMsg(err.message || 'Authentication failed.');
        }
      } else {
        setErrorMsg('An unexpected error occurred during login.');
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
        padding: '2rem 1.5rem',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
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
          maxWidth: '440px',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Enter the Citadel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Resume your quests and claim authoritative progression.
          </p>
        </div>

        {/* Server Status Notice if backend offline */}
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

        {/* Error Announcement Banner */}
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
            id="login-error"
          >
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="login-email" className="rpg-label">
              Adventurer Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`rpg-input ${errorMsg ? 'rpg-input-error' : ''}`}
                placeholder="adventurer@example.com"
                aria-describedby={errorMsg ? 'login-error' : undefined}
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

          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" className="rpg-label">
                Master Key (Password)
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`rpg-input ${errorMsg ? 'rpg-input-error' : ''}`}
                placeholder="••••••••••••"
                aria-describedby={errorMsg ? 'login-error' : undefined}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="rpg-btn rpg-btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Entering the Citadel...' : 'Enter Citadel'}
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
          New to the realm?{' '}
          <Link
            to="/register"
            style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}
          >
            Forge a New Character
          </Link>
        </div>
      </div>
    </div>
  );
};
