import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

export const VerifyMagicLinkPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLinkToken } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorText, setErrorText] = useState<string>('');
  const [redirectPath, setRedirectPath] = useState<string>('/app/dashboard');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorText('No magic link verification token was provided.');
      return;
    }

    let isMounted = true;

    const runVerification = async () => {
      try {
        const result = await verifyMagicLinkToken(token);
        if (!isMounted) return;

        setStatus('success');
        const target = result.redirectTo || (result.isAdmin ? '/admin' : '/app/dashboard');
        setRedirectPath(target);

        setTimeout(() => {
          navigate(target, { replace: true });
        }, 1200);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        setErrorText(
          err?.message ||
          'This magic link is invalid, expired, or has already been used. Please request a new one.'
        );
      }
    };

    void runVerification();

    return () => {
      isMounted = false;
    };
  }, [searchParams, verifyMagicLinkToken, navigate]);

  return (
    <div className="citadel-auth-canvas" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div
        className="citadel-console-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Terminal Header */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <img
            src="/achiever-logo.png"
            alt="Achiever"
            style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)' }}
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
            Achiever
          </span>
        </div>

        {status === 'verifying' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Loader2 size={32} className="animate-spin" color="#38bdf8" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Authenticating...
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Verifying your secure magic link token with the Citadel core.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Identity Verified!
            </h2>
            <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Redirecting you to {redirectPath === '/admin' ? 'Admin Control Center' : 'your Quest Dashboard'}...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              <Shield size={14} color="#38bdf8" />
              <span>TLS Authenticated Session Initialized</span>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={36} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Authentication Failed
            </h2>
            <p style={{ color: '#fca5a5', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              {errorText}
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
              }}
            >
              <ArrowLeft size={16} />
              <span>Return to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
