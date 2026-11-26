import React from 'react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Bharat Gurukul 360 ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-canvas)] text-[var(--text-primary)]">
          <div className="max-w-lg w-full border border-[var(--border-hairline)] bg-[var(--bg-elevated)] rounded-xl p-8 space-y-4">
            <h1 className="font-display text-2xl font-semibold">
              Something interrupted your session
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {this.state.errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:opacity-95 transition-opacity"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
