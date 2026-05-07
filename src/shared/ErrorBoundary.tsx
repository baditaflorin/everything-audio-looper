import type { ReactNode } from 'react';
import { Component } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'The app hit an unexpected error.'
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-ink px-6 py-10 text-slate-100">
          <div className="mx-auto max-w-2xl rounded-md border border-coral/50 bg-panel p-6">
            <h1 className="text-2xl font-semibold">Something went sideways</h1>
            <p className="mt-3 text-slate-300">{this.state.message}</p>
            <button
              className="mt-5 rounded-md bg-mint px-4 py-2 font-semibold text-ink"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
