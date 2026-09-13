import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Life RPG UI boundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: 'var(--bg-canvas)',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <ShieldAlert size={36} color="#ef4444" />
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
            The Magical Connection was Severed
          </h1>

          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '2rem', lineHeight: 1.6 }}>
            An unexpected error interrupted your Citadel view. Your persistent data in the PostgreSQL database is safe.
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className="rpg-btn rpg-btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <RefreshCw size={18} /> Recover &amp; Return to Citadel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
