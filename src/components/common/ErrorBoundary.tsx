import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare setState: (state: Partial<ErrorBoundaryState>) => void;

  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readableMessage = error?.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(readableMessage);
      if (parsed && typeof parsed === 'object' && parsed.error) {
        readableMessage = `${parsed.error}${parsed.path ? ` (${parsed.operationType || 'operation'} on ${parsed.path})` : ''}`;
      }
    } catch {
      // Keep plain error message
    }
    return { hasError: true, errorMessage: readableMessage };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ERP ErrorBoundary caught an error:', error, info);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-100 dark:bg-[#2c363b]">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#435055] border border-slate-200 dark:border-[#55666d] p-6 shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-200 break-words">
                {this.state.errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold cursor-pointer transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
