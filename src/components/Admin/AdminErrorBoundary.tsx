import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
  key?: React.Key;
}

export interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin Panel Component Error Caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50/90 border border-red-200 rounded-2xl m-4 space-y-4 text-xs text-red-900 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-950">
                {this.props.fallbackTitle || 'Admin Section Temporary Display Notice'}
              </h3>
              <p className="text-red-700 mt-0.5">
                This section encountered a render notice. The rest of your store remains operational.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 bg-red-100/80 rounded-xl font-mono text-[11px] text-red-950 break-words max-h-32 overflow-y-auto border border-red-200">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading Section</span>
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-800 font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
