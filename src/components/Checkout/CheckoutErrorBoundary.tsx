import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CheckoutErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Checkout error boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-serif font-bold text-neutral-900">
              {this.props.fallbackTitle || 'Checkout Notice'}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We encountered a temporary hiccup processing your request. Your cart and session remain safe. Please try again or return to the storefront.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-neutral-100 rounded-xl text-[11px] font-mono text-neutral-700 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                type="button"
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Checkout</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                type="button"
                className="py-3 px-4 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
