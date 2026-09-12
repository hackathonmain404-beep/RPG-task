import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { 
  AlertCircle, 
  UserX, 
  AlertTriangle, 
  ArrowLeft, 
  Check, 
  Loader2, 
  ShieldCheck,
  RefreshCw,
  Mail,
  Send,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  useDocumentMetadata('Achiever Login', {
    description: 'Access your persistent Life RPG character, quest log, and daily momentum.',
    noindex: false,
  });

  const { signInWithGoogle, signInWithGithub, signInAsGuest, signInWithMagicLink, serverReachable, checkServerReachability } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);
  const [localDevToken, setLocalDevToken] = useState<string | null>(null);

  const [activeProvider, setActiveProvider] = useState<'google' | 'github' | 'guest' | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'granted' | 'denied'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [isCheckingReachability, setIsCheckingReachability] = useState(false);

  // Auto-probe backend reachability when login page mounts
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

  // Subtle pointer depth parallax on desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
      setCardTilt({
        x: -yPct * 2, // max 2 deg tilt
        y: xPct * 2.5,
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSendMagicLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = emailInput.trim();
    if (!clean) {
      setErrorMsg('Please enter your email address to continue.');
      return;
    }

    setErrorMsg(null);
    setIsSendingMagicLink(true);

    try {
      const res = await signInWithMagicLink(clean);
      setMagicLinkSentTo(clean);
      if (res.verificationToken) {
        setLocalDevToken(res.verificationToken);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send magic link. Please verify your connection.');
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setActiveProvider('google');
    setAuthStatus('connecting');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'We could not authenticate with Google. Please try again.';
      setErrorMsg(message);
      setAuthStatus('denied');
      setActiveProvider(null);
    }
  };

  const handleGithubSignIn = async () => {
    setErrorMsg(null);
    setActiveProvider('github');
    setAuthStatus('connecting');
    try {
      await signInWithGithub();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'We could not authenticate with GitHub. Please try again.';
      setErrorMsg(message);
      setAuthStatus('denied');
      setActiveProvider(null);
    }
  };

  const handleGuestSignIn = () => {
    setErrorMsg(null);
    setActiveProvider('guest');
    setAuthStatus('connecting');

    // Smooth access granted confirmation sequence
    setTimeout(() => {
      setAuthStatus('granted');
      signInAsGuest();
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 650);
    }, 300);
  };

  const isConnecting = authStatus === 'connecting' || isSendingMagicLink;
  const isGranted = authStatus === 'granted';

  return (
    <div className="citadel-auth-canvas" style={{ padding: '1.25rem 1.5rem 2rem' }}>
      {/* Background Geometric Citadel Gate Portal */}
      <div className="citadel-portal-container" aria-hidden="true">
        <div className="citadel-portal-ring-outer" />
        <div className="citadel-portal-ring-mid" />
        <div className="citadel-portal-glow" />
      </div>

      {/* Top Header Bar: Back to Landing Page & Security Metadata */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.5rem 0',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#38bdf8';
            e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
            e.currentTarget.style.transform = 'translateX(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
          aria-label="Return to Life RPG Homepage"
        >
          <ArrowLeft size={16} />
          <span>Back to Citadel</span>
        </Link>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            letterSpacing: '0.04em',
          }}
        >
          <ShieldCheck size={14} color="#38bdf8" />
          <span>TLS 256-BIT // MAGIC LINK AUTH</span>
        </div>
      </header>

      {/* Main Centered Authentication Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto 0',
          width: '100%',
        }}
      >
        {/* Terminal Console Card */}
        <div
          className={`citadel-console-card ${isGranted ? 'citadel-access-granted' : ''}`}
          style={{
            transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
            maxWidth: '460px',
          }}
        >
          {/* Technical HUD Corner Brackets */}
          <span className="citadel-corner-bracket citadel-corner-tl" aria-hidden="true" />
          <span className="citadel-corner-bracket citadel-corner-tr" aria-hidden="true" />
          <span className="citadel-corner-bracket citadel-corner-bl" aria-hidden="true" />
          <span className="citadel-corner-bracket citadel-corner-br" aria-hidden="true" />

          {/* Terminal Console Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            {/* Luminous Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img
                src="/achiever-logo.png"
                alt="Achiever Logo"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  boxShadow: '0 0 24px rgba(56, 189, 248, 0.5)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.5rem',
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Achiever
              </span>
            </div>

            {/* System Status Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.6rem',
              }}
            >
              <span className="citadel-led citadel-led-online" aria-hidden="true" />
              <span>Direct Magic Link</span>
              <span style={{ opacity: 0.4 }}>//</span>
              <span style={{ color: '#38bdf8' }}>Passwordless Portal</span>
            </div>

            {/* Title & Subtitle */}
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {magicLinkSentTo ? 'Check your inbox' : 'Enter the Citadel'}
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                margin: '0 auto',
                maxWidth: '360px',
              }}
            >
              {magicLinkSentTo
                ? `We sent a magic sign-in link to ${magicLinkSentTo}. Click the link to log in instantly.`
                : 'Enter your email to sign in or create an account with a secure Magic Link.'}
            </p>
          </div>

          {/* Citadel Offline Notice */}
          {!serverReachable && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fde047',
                fontSize: '0.82rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                lineHeight: 1.45,
              }}
              role="status"
            >
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: '#fbbf24' }}>Citadel Backend Offline:</strong> The server API is currently unreachable. You can continue as a Guest with full local progression.
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

          {/* Access Denied Error Announcement */}
          {errorMsg && (
            <div
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
              }}
              role="alert"
              id="login-error"
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STATE A: MAGIC LINK SENT CONFIRMATION                            */}
          {/* ---------------------------------------------------------------- */}
          {magicLinkSentTo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0.5rem auto 0.25rem',
                }}
              >
                <Mail size={30} color="#38bdf8" />
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.86rem',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>
                  Magic link is on its way!
                </div>
                The single-use link expires in <strong>15 minutes</strong>. Simply click it to authenticate without passwords.
              </div>

              {/* Dev Simulation Button (Instant testing without SMTP server) */}
              {localDevToken && (
                <div
                  style={{
                    backgroundColor: 'rgba(124, 58, 237, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: '10px',
                    padding: '0.9rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    <Sparkles size={14} />
                    <span>Instant Link Simulator (Active)</span>
                  </div>
                  <Link
                    to={`/auth/verify?token=${localDevToken}`}
                    id="simulate-magic-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    <span>Click to Enter Citadel / Control Center</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleSendMagicLink()}
                  disabled={isSendingMagicLink}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: isSendingMagicLink ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <RefreshCw size={13} className={isSendingMagicLink ? 'animate-spin' : ''} />
                  <span>Resend Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMagicLinkSentTo(null);
                    setLocalDevToken(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Different Email
                </button>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------------- */
            /* STATE B: PRIMARY MAGIC LINK EMAIL INPUT & ACTION FORM            */
            /* ---------------------------------------------------------------- */
            <form onSubmit={handleSendMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label
                  htmlFor="magic-email-input"
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    marginBottom: '0.45rem',
                    textAlign: 'left',
                  }}
                >
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    color="#64748b"
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                  <input
                    id="magic-email-input"
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isSendingMagicLink}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.75rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#38bdf8';
                      e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Primary Action Button: Continue with Magic Link */}
              <button
                type="submit"
                id="btn-magic-link"
                disabled={isSendingMagicLink || !emailInput.trim()}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isSendingMagicLink || !emailInput.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSendingMagicLink || !emailInput.trim() ? 0.65 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.55rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.2rem',
                }}
                onMouseEnter={(e) => {
                  if (!isSendingMagicLink && emailInput.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 132, 199, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.35)';
                }}
              >
                {isSendingMagicLink ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Dispatching Magic Link...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Continue with Magic Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Technical HUD Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.25rem 0 1rem',
              color: 'var(--text-tertiary)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
            <span>✦ or continue with ✦</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* Secondary OAuth & Guest Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Google OAuth Button */}
            <button
              type="button"
              disabled={isConnecting || isGranted}
              onClick={handleGoogleSignIn}
              className="citadel-auth-btn citadel-btn-google"
              id="login-google"
              aria-label="Continue authentication with Google"
            >
              {activeProvider === 'google' && isConnecting ? (
                <>
                  <Loader2 size={18} className="animate-spin" color="#38bdf8" />
                  <span>Connecting to Google...</span>
                </>
              ) : activeProvider === 'google' && isGranted ? (
                <>
                  <Check size={18} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Access Granted</span>
                </>
              ) : (
                <>
                  <svg height="19" width="19" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              disabled={isConnecting || isGranted}
              onClick={handleGithubSignIn}
              className="citadel-auth-btn citadel-btn-github"
              id="login-github"
              aria-label="Continue authentication with GitHub"
            >
              {activeProvider === 'github' && isConnecting ? (
                <>
                  <Loader2 size={18} className="animate-spin" color="#38bdf8" />
                  <span>Connecting to GitHub...</span>
                </>
              ) : activeProvider === 'github' && isGranted ? (
                <>
                  <Check size={18} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Access Granted</span>
                </>
              ) : (
                <>
                  <svg height="19" width="19" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  <span>GitHub</span>
                </>
              )}
            </button>

            {/* Guest Mode Button */}
            <button
              type="button"
              disabled={isConnecting || isGranted}
              onClick={handleGuestSignIn}
              className="citadel-auth-btn citadel-btn-guest"
              id="login-guest"
              aria-label="Use temporary guest profile without database persistence"
            >
              {activeProvider === 'guest' && isConnecting ? (
                <>
                  <Loader2 size={18} className="animate-spin" color="#c084fc" />
                  <span>Initializing Guest Profile...</span>
                </>
              ) : activeProvider === 'guest' && isGranted ? (
                <>
                  <Check size={18} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Access Granted — Traveler</span>
                </>
              ) : (
                <>
                  <UserX size={18} />
                  <span>Continue as Guest</span>
                </>
              )}
            </button>

            {/* Guest Mode Warning Panel */}
            <div
              style={{
                marginTop: '0.2rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-start',
                lineHeight: 1.45,
              }}
            >
              <AlertTriangle size={15} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.78rem', color: '#fbbf24' }}>
                Guest progress <strong>won&apos;t be saved</strong> to the database.
                <div style={{ color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                  Sign in with Magic Link, Google, or GitHub to persist your character stats.
                </div>
              </div>
            </div>
          </div>

          {/* Legal / Policy Links */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              textAlign: 'center',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Link
              to="/privacy"
              style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              Privacy
            </Link>
            <span style={{ opacity: 0.3 }}>·</span>
            <Link
              to="/terms"
              style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              Terms
            </Link>
            <span style={{ opacity: 0.3 }}>·</span>
            <Link
              to="/accessibility"
              style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              Accessibility
            </Link>
          </div>
        </div>

        {/* Motivational Tagline & Status Telemetry */}
        <div
          style={{
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.45rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.14em',
              color: '#38bdf8',
              opacity: 0.85,
              textTransform: 'uppercase',
            }}
          >
            &quot;Your Progress Awaits.&quot;
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-tertiary)',
            }}
          >
            <span>● QUEST SYSTEM ONLINE</span>
            <span>● MAGIC LINK READY</span>
          </div>
        </div>
      </main>

      {/* Bottom Spacer for perfect optical centering */}
      <footer style={{ height: '24px', opacity: 0 }} aria-hidden="true" />
    </div>
  );
};
